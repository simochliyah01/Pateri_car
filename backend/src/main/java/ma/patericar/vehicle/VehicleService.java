package ma.patericar.vehicle;

import lombok.RequiredArgsConstructor;
import ma.patericar.common.exceptions.ConflictException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.vehicle.dto.CreateVehicleRequest;
import ma.patericar.vehicle.dto.UpdateVehicleRequest;
import ma.patericar.vehicle.dto.VehicleDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
