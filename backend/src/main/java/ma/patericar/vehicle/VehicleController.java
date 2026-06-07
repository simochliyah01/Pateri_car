package ma.patericar.vehicle;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;
import ma.patericar.vehicle.dto.CreateVehicleRequest;
import ma.patericar.vehicle.dto.UpdateVehicleRequest;
import ma.patericar.vehicle.dto.VehicleDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicles", description = "Vehicle fleet management endpoints")
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Get all vehicles")
    @ApiResponse(responseCode = "200", description = "List of all vehicles")
    public List<VehicleDto> findAll() {
        return vehicleService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vehicle by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vehicle found"),
        @ApiResponse(responseCode = "404", description = "Vehicle not found")
    })
    public VehicleDto findById(@PathVariable Long id) {
        return vehicleService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Create a new vehicle")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Vehicle created"),
        @ApiResponse(responseCode = "400", description = "Validation error"),
        @ApiResponse(responseCode = "409", description = "License plate already exists")
    })
    public ResponseEntity<VehicleDto> create(@Valid @RequestBody CreateVehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Update an existing vehicle")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Vehicle updated"),
        @ApiResponse(responseCode = "404", description = "Vehicle not found"),
        @ApiResponse(responseCode = "409", description = "License plate already exists")
    })
    public VehicleDto update(@PathVariable Long id,
                             @Valid @RequestBody UpdateVehicleRequest request) {
        return vehicleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a vehicle")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Vehicle deleted"),
        @ApiResponse(responseCode = "404", description = "Vehicle not found")
    })
    public void delete(@PathVariable Long id) {
        vehicleService.delete(id);
    }

    @GetMapping("/by-status")
    @Operation(summary = "Get vehicles by status")
    @ApiResponse(responseCode = "200", description = "Filtered vehicle list")
    public List<VehicleDto> findByStatus(@RequestParam VehicleStatus status) {
        return vehicleService.findByStatus(status);
    }

    @GetMapping("/by-category")
    @Operation(summary = "Get vehicles by category")
    @ApiResponse(responseCode = "200", description = "Filtered vehicle list")
    public List<VehicleDto> findByCategory(@RequestParam VehicleCategory category) {
        return vehicleService.findByCategory(category);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @Operation(summary = "Upload or replace vehicle image (max 2 MB)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Image uploaded"),
        @ApiResponse(responseCode = "400", description = "Invalid file"),
        @ApiResponse(responseCode = "404", description = "Vehicle not found")
    })
    public VehicleDto uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return vehicleService.uploadImage(id, file);
    }

    @GetMapping("/{id}/image")
    @Operation(summary = "Get vehicle image")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Image bytes"),
        @ApiResponse(responseCode = "404", description = "No image or vehicle not found")
    })
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        return vehicleService.getImage(id);
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete vehicle image")
    public void deleteImage(@PathVariable Long id) {
        vehicleService.deleteImage(id);
    }
}
