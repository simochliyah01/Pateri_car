package ma.patericar.reservation.dto;

import ma.patericar.reservation.domain.OptionType;

import java.math.BigDecimal;

public record ReservationOptionDto(
    Long id,
    OptionType optionType,
    BigDecimal pricePerDay,
    BigDecimal totalPrice
) {}
