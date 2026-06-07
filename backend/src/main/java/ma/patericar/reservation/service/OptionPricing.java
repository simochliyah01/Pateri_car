package ma.patericar.reservation.service;

import ma.patericar.reservation.domain.OptionType;

import java.math.BigDecimal;
import java.util.Map;

public final class OptionPricing {

    private static final Map<OptionType, BigDecimal> CATALOG = Map.of(
        OptionType.GPS,               new BigDecimal("50.00"),
        OptionType.CHILD_SEAT,        new BigDecimal("30.00"),
        OptionType.ADDITIONAL_DRIVER, new BigDecimal("100.00"),
        OptionType.FULL_INSURANCE,    new BigDecimal("80.00")
    );

    private OptionPricing() {}

    public static BigDecimal getPriceFor(OptionType type) {
        return CATALOG.getOrDefault(type, BigDecimal.ZERO);
    }
}
