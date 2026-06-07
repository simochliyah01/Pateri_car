package ma.patericar.reservation.service;

import ma.patericar.reservation.domain.OptionType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("OptionPricing — unit tests")
class OptionPricingTest {

    @Test
    @DisplayName("GPS option should cost 50 DH per day")
    void getPriceFor_GPS_returns50() {
        assertThat(OptionPricing.getPriceFor(OptionType.GPS))
                .isEqualByComparingTo(new BigDecimal("50.00"));
    }

    @Test
    @DisplayName("Child seat option should cost 30 DH per day")
    void getPriceFor_CHILD_SEAT_returns30() {
        assertThat(OptionPricing.getPriceFor(OptionType.CHILD_SEAT))
                .isEqualByComparingTo(new BigDecimal("30.00"));
    }

    @Test
    @DisplayName("Additional driver option should cost 100 DH per day")
    void getPriceFor_ADDITIONAL_DRIVER_returns100() {
        assertThat(OptionPricing.getPriceFor(OptionType.ADDITIONAL_DRIVER))
                .isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    @DisplayName("Full insurance option should cost 80 DH per day")
    void getPriceFor_FULL_INSURANCE_returns80() {
        assertThat(OptionPricing.getPriceFor(OptionType.FULL_INSURANCE))
                .isEqualByComparingTo(new BigDecimal("80.00"));
    }
}
