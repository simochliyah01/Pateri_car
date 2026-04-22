package ma.patericar.vehicle.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import ma.patericar.vehicle.FuelType;
import ma.patericar.vehicle.Transmission;
import ma.patericar.vehicle.VehicleCategory;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateVehicleRequest {

    @NotBlank
    private String brand;

    @NotBlank
    private String model;

    @NotNull
    @Min(1990)
    @Max(2030)
    private Integer year;

    @NotBlank
    private String licensePlate;

    private String vin;
    private String color;

    @NotNull
    private VehicleCategory category;

    @NotNull
    private Transmission transmission;

    @NotNull
    private FuelType fuelType;

    @NotNull
    @Min(1)
    private Integer seats;

    private Integer doors;
    private Integer powerHp;
    private Integer engineCc;
    private BigDecimal consumptionPer100km;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal pricePerDay;

    private BigDecimal pricePerWeek;
    private BigDecimal pricePerMonth;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal deposit;

    private Integer kmIncludedPerDay;
    private BigDecimal pricePerExtraKm;
    private LocalDate insuranceExpiry;
    private LocalDate registrationExpiry;
    private LocalDate technicalVisitExpiry;
    private Integer currentMileage;
    private Integer lastOilChangeKm;
    private String description;
}
