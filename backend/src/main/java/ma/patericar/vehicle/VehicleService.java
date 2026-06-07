package ma.patericar.vehicle;

import lombok.RequiredArgsConstructor;
import ma.patericar.common.exceptions.ConflictException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.vehicle.dto.CreateVehicleRequest;
import ma.patericar.vehicle.dto.UpdateVehicleRequest;
import ma.patericar.vehicle.dto.VehicleDto;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<VehicleDto> findAll() {
        return vehicleRepository.findAll()
                .stream()
                .map(VehicleMapper::toDto)
                .toList();
    }

    public VehicleDto findById(Long id) {
        return vehicleRepository.findById(id)
                .map(VehicleMapper::toDto)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
    }

    @Transactional
    public VehicleDto create(CreateVehicleRequest request) {
        if (vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new ConflictException(
                    "Vehicle with license plate '" + request.getLicensePlate() + "' already exists");
        }
        Vehicle saved = vehicleRepository.save(VehicleMapper.toEntity(request));
        return VehicleMapper.toDto(saved);
    }

    @Transactional
    public VehicleDto update(Long id, UpdateVehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));

        if (request.getLicensePlate() != null
                && !request.getLicensePlate().equals(vehicle.getLicensePlate())
                && vehicleRepository.existsByLicensePlate(request.getLicensePlate())) {
            throw new ConflictException(
                    "Vehicle with license plate '" + request.getLicensePlate() + "' already exists");
        }

        VehicleMapper.updateEntity(vehicle, request);
        return VehicleMapper.toDto(vehicleRepository.save(vehicle));
    }

    @Transactional
    public void delete(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Vehicle", id);
        }
        vehicleRepository.deleteById(id);
    }

    public List<VehicleDto> findByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatus(status)
                .stream()
                .map(VehicleMapper::toDto)
                .toList();
    }

    public List<VehicleDto> findByCategory(VehicleCategory category) {
        return vehicleRepository.findByCategory(category)
                .stream()
                .map(VehicleMapper::toDto)
                .toList();
    }

    @Transactional
    public VehicleDto uploadImage(Long id, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier est vide");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Le fichier doit être une image");
        }
        if (file.getSize() > 2L * 1024 * 1024) {
            throw new IllegalArgumentException("L'image ne doit pas dépasser 2 MB");
        }
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
        vehicle.setImageData(file.getBytes());
        vehicle.setImageContentType(contentType);
        vehicle.setImageUploadedAt(LocalDateTime.now());
        return VehicleMapper.toDto(vehicleRepository.save(vehicle));
    }

    public ResponseEntity<byte[]> getImage(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
        if (vehicle.getImageData() == null) {
            return ResponseEntity.notFound().build();
        }
        String ct = vehicle.getImageContentType() != null
                ? vehicle.getImageContentType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ct))
                .header("Cache-Control", "public, max-age=3600")
                .body(vehicle.getImageData());
    }

    @Transactional
    public void deleteImage(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", id));
        vehicle.setImageData(null);
        vehicle.setImageContentType(null);
        vehicle.setImageUploadedAt(null);
        vehicleRepository.save(vehicle);
    }
}
