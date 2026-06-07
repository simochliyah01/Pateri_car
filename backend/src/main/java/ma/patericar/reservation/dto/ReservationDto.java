package ma.patericar.reservation.dto;

import ma.patericar.reservation.domain.PickupLocation;
import ma.patericar.reservation.domain.ReservationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public record ReservationDto(
    Long id,
    String reservationNumber,
    Long clientId,
    String clientName,
    String clientEmail,
    Long vehicleId,
    String vehicleBrand,
    String vehicleModel,
    String vehicleLicensePlate,
    PickupLocation pickupLocation,
    String pickupAddress,
    PickupLocation returnLocation,
    LocalDate startDate,
    LocalDate endDate,
    Integer durationDays,
    BigDecimal basePrice,
    BigDecimal optionsPrice,
    BigDecimal deliveryFee,
    BigDecimal discountAmount,
    BigDecimal totalPrice,
    ReservationStatus status,
    String internalNotes,
    OffsetDateTime confirmedAt,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    List<ReservationOptionDto> options
) {}
