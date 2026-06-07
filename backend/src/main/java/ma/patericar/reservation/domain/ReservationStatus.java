package ma.patericar.reservation.domain;

public enum ReservationStatus {
    PENDING,      // Awaiting confirmation by agency
    CONFIRMED,    // Confirmed, awaiting pickup
    IN_PROGRESS,  // Customer has picked up the vehicle
    COMPLETED,    // Vehicle returned, payment done
    CANCELLED,    // Cancelled by customer or agency
    DISPUTE       // Under dispute
}
