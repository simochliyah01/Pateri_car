package ma.patericar.vehicle.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import ma.patericar.vehicle.FuelType;
import ma.patericar.vehicle.Transmission;
import ma.patericar.vehicle.VehicleCategory;
import ma.patericar.vehicle.VehicleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateVehicleRequest {

    private String brand;
    private String model;

    @Min(1990) @Max(2030)
    private Integer year;

    private String licensePlate;
    private String vin;
    private String color;
    private VehicleCategory category;
    private Transmission transmission;
    private FuelType fuelType;

    @Min(1)
    private Integer seats;

    private Integer doors;
    private Integer powerHp;
    private Integer engineCc;
    private BigDecimal consumptionPer100km;

    @DecimalMin("0.01")
    private BigDecimal pricePerDay;

    private BigDecimal pricePerWeek;
    private BigDecimal pricePerMonth;

    @DecimalMin("0.00")
    private BigDecimal deposit;

    private Integer kmIncludedPerDay;
    private BigDecimal pricePerExtraKm;
    private LocalDate insuranceExpiry;
    private LocalDate registrationExpiry;
    private LocalDate technicalVisitExpiry;
    private Integer currentMileage;
    private Integer lastOilChangeKm;
    private VehicleStatus status;
    private String description;
}
