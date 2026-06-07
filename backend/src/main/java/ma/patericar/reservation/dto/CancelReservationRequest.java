package ma.patericar.reservation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelReservationRequest(
    @NotBlank(message = "Cancellation reason is required")
    @Size(max = 500)
    String reason
) {}
