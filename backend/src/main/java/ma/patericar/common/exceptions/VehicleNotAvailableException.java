package ma.patericar.common.exceptions;

import java.time.LocalDate;

public class VehicleNotAvailableException extends RuntimeException {

    public VehicleNotAvailableException(Long vehicleId, LocalDate startDate, LocalDate endDate) {
        super(String.format("Vehicle %d is not available from %s to %s", vehicleId, startDate, endDate));
    }
}
