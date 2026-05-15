package ma.patericar.client;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ClientDto(
    Long id,
    String firstName,
    String lastName,
    String cinPassport,
    LocalDate dateOfBirth,
    String phone,
    String email,
    String address,
    String city,
    ClientStatus status,
    Boolean isBlacklisted,
    String blacklistReason,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt,
    long reservationCount
) {}
