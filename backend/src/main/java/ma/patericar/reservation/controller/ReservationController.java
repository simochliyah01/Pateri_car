package ma.patericar.reservation.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.patericar.reservation.domain.ReservationStatus;
import ma.patericar.reservation.dto.AvailabilityCheckRequest;
import ma.patericar.reservation.dto.AvailabilityResponse;
import ma.patericar.reservation.dto.CancelReservationRequest;
import ma.patericar.reservation.dto.CreateReservationRequest;
import ma.patericar.reservation.dto.ReservationDto;
import ma.patericar.reservation.service.ReservationService;
import ma.patericar.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
@Tag(name = "Reservations", description = "Reservation management endpoints")
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping("/availability/{vehicleId}")
    @Operation(summary = "Check vehicle availability for a date range")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Availability result"),
        @ApiResponse(responseCode = "404", description = "Vehicle not found")
    })
    public AvailabilityResponse checkAvailability(
            @PathVariable Long vehicleId,
            @Valid @RequestBody AvailabilityCheckRequest request) {
        return reservationService.checkAvailability(vehicleId, request);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new reservation")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reservation created"),
        @ApiResponse(responseCode = "400", description = "Validation error or invalid dates"),
        @ApiResponse(responseCode = "404", description = "Client or vehicle not found"),
        @ApiResponse(responseCode = "409", description = "Vehicle not available")
    })
    public ResponseEntity<ReservationDto> create(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(reservationService.create(request, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get reservation by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation found"),
        @ApiResponse(responseCode = "404", description = "Reservation not found")
    })
    public ReservationDto findById(@PathVariable Long id) {
        return reservationService.findById(id);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    @Operation(summary = "Get all reservations for a client")
    @ApiResponse(responseCode = "200", description = "Client reservation list")
    public List<ReservationDto> findByClient(@PathVariable Long clientId) {
        return reservationService.findByClientId(clientId);
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get own reservations — by client email for CLIENT role, by commercial ID for staff")
    @ApiResponse(responseCode = "200", description = "My reservation list")
    public List<ReservationDto> findMine(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        if ("CLIENT".equals(currentUser.getRole().getName())) {
            return reservationService.findByClientEmail(currentUser.getEmail());
        }
        return reservationService.findByCommercialId(currentUser.getId());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    @Operation(summary = "Get all reservations (paginated)")
    @ApiResponse(responseCode = "200", description = "Paginated reservation list")
    public Page<ReservationDto> findAll(Pageable pageable) {
        return reservationService.findAll(pageable);
    }

    @GetMapping("/by-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    @Operation(summary = "Get reservations filtered by status (paginated)")
    @ApiResponse(responseCode = "200", description = "Filtered reservation list")
    public Page<ReservationDto> findByStatus(
            @RequestParam ReservationStatus status,
            Pageable pageable) {
        return reservationService.findByStatus(status, pageable);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    @Operation(summary = "Confirm a pending reservation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation confirmed"),
        @ApiResponse(responseCode = "404", description = "Reservation not found"),
        @ApiResponse(responseCode = "422", description = "Invalid status transition")
    })
    public ReservationDto confirm(@PathVariable Long id) {
        return reservationService.confirm(id);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel a reservation")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reservation cancelled"),
        @ApiResponse(responseCode = "404", description = "Reservation not found"),
        @ApiResponse(responseCode = "422", description = "Invalid status transition")
    })
    public ReservationDto cancel(
            @PathVariable Long id,
            @Valid @RequestBody CancelReservationRequest request) {
        return reservationService.cancel(id, request.reason());
    }
}
