package ma.patericar.vehicle;

import ma.patericar.common.exceptions.ConflictException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.vehicle.dto.CreateVehicleRequest;
import ma.patericar.vehicle.dto.VehicleDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("VehicleService — unit tests")
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Vehicle buildVehicle(Long id, String licensePlate) {
        return Vehicle.builder()
                .id(id)
                .brand("Dacia")
                .model("Logan")
                .year(2022)
                .licensePlate(licensePlate)
                .category(VehicleCategory.ECONOMIQUE)
                .transmission(Transmission.MANUAL)
                .fuelType(FuelType.DIESEL)
                .seats(5)
                .pricePerDay(new BigDecimal("150.00"))
                .deposit(new BigDecimal("2000.00"))
                .status(VehicleStatus.AVAILABLE)
                .build();
    }

    private CreateVehicleRequest buildCreateRequest(String licensePlate) {
        CreateVehicleRequest req = new CreateVehicleRequest();
        req.setBrand("Dacia");
        req.setModel("Logan");
        req.setYear(2022);
        req.setLicensePlate(licensePlate);
        req.setCategory(VehicleCategory.ECONOMIQUE);
        req.setTransmission(Transmission.MANUAL);
        req.setFuelType(FuelType.DIESEL);
        req.setSeats(5);
        req.setPricePerDay(new BigDecimal("150.00"));
        req.setDeposit(new BigDecimal("2000.00"));
        return req;
    }

    // ── findAll ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findAll: should return empty list when no vehicles exist")
    void findAll_shouldReturnEmptyList_whenRepositoryIsEmpty() {
        when(vehicleRepository.findAll()).thenReturn(List.of());

        List<VehicleDto> result = vehicleService.findAll();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findAll: should map all vehicles to DTOs")
    void findAll_shouldReturnMappedDtos_whenVehiclesExist() {
        when(vehicleRepository.findAll()).thenReturn(List.of(
                buildVehicle(1L, "AA-001-AA"),
                buildVehicle(2L, "BB-002-BB")
        ));

        List<VehicleDto> result = vehicleService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getLicensePlate()).isEqualTo("AA-001-AA");
        assertThat(result.get(1).getLicensePlate()).isEqualTo("BB-002-BB");
    }

    // ── findById ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById: should return DTO when vehicle exists")
    void findById_shouldReturnDto_whenVehicleExists() {
        Vehicle vehicle = buildVehicle(1L, "AA-001-AA");
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        VehicleDto dto = vehicleService.findById(1L);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getBrand()).isEqualTo("Dacia");
        assertThat(dto.getLicensePlate()).isEqualTo("AA-001-AA");
    }

    @Test
    @DisplayName("findById: should throw ResourceNotFoundException when vehicle does not exist")
    void findById_shouldThrowResourceNotFoundException_whenNotFound() {
        when(vehicleRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vehicleService.findById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("create: should throw ConflictException when license plate already exists")
    void create_shouldThrowConflictException_whenLicensePlateAlreadyExists() {
        CreateVehicleRequest req = buildCreateRequest("TAKEN-001");
        when(vehicleRepository.existsByLicensePlate("TAKEN-001")).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.create(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("TAKEN-001");

        verify(vehicleRepository, never()).save(any());
    }

    @Test
    @DisplayName("create: should save and return DTO when license plate is new")
    void create_shouldReturnDto_whenLicensePlateIsNew() {
        CreateVehicleRequest req = buildCreateRequest("NEW-001");
        Vehicle saved = buildVehicle(1L, "NEW-001");

        when(vehicleRepository.existsByLicensePlate("NEW-001")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(saved);

        VehicleDto dto = vehicleService.create(req);

        assertThat(dto.getLicensePlate()).isEqualTo("NEW-001");
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    // ── uploadImage validations ───────────────────────────────────────────────

    @Test
    @DisplayName("uploadImage: should throw IllegalArgumentException when file is empty")
    void uploadImage_shouldThrow_whenFileIsEmpty() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> vehicleService.uploadImage(1L, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vide");
    }

    @Test
    @DisplayName("uploadImage: should throw IllegalArgumentException when content type is not image")
    void uploadImage_shouldThrow_whenContentTypeIsNotImage() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");

        assertThatThrownBy(() -> vehicleService.uploadImage(1L, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("image");
    }

    @Test
    @DisplayName("uploadImage: should throw IllegalArgumentException when file exceeds 2 MB")
    void uploadImage_shouldThrow_whenFileSizeExceeds2MB() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/jpeg");
        when(file.getSize()).thenReturn(3L * 1024 * 1024); // 3 MB

        assertThatThrownBy(() -> vehicleService.uploadImage(1L, file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("2 MB");
    }
}
