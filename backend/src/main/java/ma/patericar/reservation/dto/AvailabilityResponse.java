package ma.patericar.reservation.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AvailabilityResponse(
    Long vehicleId,
    boolean available,
    Integer daysCount,
    BigDecimal dailyRate,
    BigDecimal estimatedTotal,
    List<DateRange> conflictingDates
) {
    public record DateRange(
        LocalDate from,
        LocalDate to
    ) {}
}
