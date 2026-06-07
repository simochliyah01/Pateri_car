package ma.patericar.reservation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import ma.patericar.reservation.domain.OptionType;
import ma.patericar.reservation.domain.PickupLocation;

import java.time.LocalDate;
import java.util.List;

public record CreateReservationRequest(
    Long clientId,  // Optional: omit for self-service (resolved from JWT); provide for admin-on-behalf

    @NotNull(message = "Vehicle ID is required")
    Long vehicleId,

    @NotNull(message = "Pickup location is required")
    PickupLocation pickupLocation,

    PickupLocation returnLocation,

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    LocalDate startDate,

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    LocalDate endDate,

    String pickupAddress,

    String clientPhone,  // Optional: used to backfill missing phone on client/user records

    @Size(max = 1000, message = "Notes must be less than 1000 characters")
    String internalNotes,

    @Valid
    List<OptionRequest> options
) {
    public record OptionRequest(
        @NotNull OptionType optionType
    ) {}
}
