package ma.patericar.reservation.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class ReservationNumberGenerator {

    public String generate() {
        int year = LocalDate.now().getYear();
        int seq = ThreadLocalRandom.current().nextInt(1000, 9999);
        return String.format("RES-%d-%04d", year, seq);
    }
}
