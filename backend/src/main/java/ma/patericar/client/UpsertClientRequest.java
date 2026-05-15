package ma.patericar.client;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record UpsertClientRequest(
    @NotBlank String firstName,
    @NotBlank String lastName,
    String cinPassport,
    LocalDate dateOfBirth,
    String phone,
    String email,
    String address,
    String city,
    ClientStatus status
) {}
