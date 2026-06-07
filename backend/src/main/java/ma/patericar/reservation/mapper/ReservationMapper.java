package ma.patericar.reservation.mapper;

import ma.patericar.reservation.domain.Reservation;
import ma.patericar.reservation.domain.ReservationOption;
import ma.patericar.reservation.dto.ReservationDto;
import ma.patericar.reservation.dto.ReservationOptionDto;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReservationMapper {

    public ReservationDto toDto(Reservation r) {
        if (r == null) return null;

        return new ReservationDto(
            r.getId(),
            r.getReservationNumber(),
            r.getClient() != null ? r.getClient().getId() : null,
            r.getClient() != null
                ? r.getClient().getFirstName() + " " + r.getClient().getLastName()
                : null,
            r.getClient() != null ? r.getClient().getEmail() : null,
            r.getVehicle() != null ? r.getVehicle().getId() : null,
            r.getVehicle() != null ? r.getVehicle().getBrand() : null,
            r.getVehicle() != null ? r.getVehicle().getModel() : null,
            r.getVehicle() != null ? r.getVehicle().getLicensePlate() : null,
            r.getPickupLocation(),
            r.getPickupAddress(),
            r.getReturnLocation(),
            r.getStartDate(),
            r.getEndDate(),
            r.getDurationDays(),
            r.getBasePrice(),
            r.getOptionsPrice(),
            r.getDeliveryFee(),
            r.getDiscountAmount(),
            r.getTotalPrice(),
            r.getStatus(),
            r.getInternalNotes(),
            r.getConfirmedAt(),
            r.getCreatedAt(),
            r.getUpdatedAt(),
            r.getOptions() != null
                ? r.getOptions().stream().map(this::toOptionDto).collect(Collectors.toList())
                : List.of()
        );
    }

    public ReservationOptionDto toOptionDto(ReservationOption o) {
        if (o == null) return null;
        return new ReservationOptionDto(
            o.getId(),
            o.getOptionType(),
            o.getPricePerDay(),
            o.getTotalPrice()
        );
    }
}
