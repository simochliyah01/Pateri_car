package ma.patericar.vehicle.dto;

import lombok.Builder;
import lombok.Value;
import ma.patericar.vehicle.FuelType;
import ma.patericar.vehicle.Transmission;
import ma.patericar.vehicle.VehicleCategory;
import ma.patericar.vehicle.VehicleStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Value
@Builder
public class VehicleDto {

    Long id;
    String brand;
    String model;
    Integer year;
    String licensePlate;
    String vin;
    String color;
    VehicleCategory category;
    Transmission transmission;
    FuelType fuelType;
    Integer seats;
    Integer doors;
    Integer powerHp;
    Integer engineCc;
    BigDecimal consumptionPer100km;
    BigDecimal pricePerDay;
    BigDecimal pricePerWeek;
    BigDecimal pricePerMonth;
    BigDecimal deposit;
    Integer kmIncludedPerDay;
    BigDecimal pricePerExtraKm;
    LocalDate insuranceExpiry;
    LocalDate registrationExpiry;
    LocalDate technicalVisitExpiry;
    Integer currentMileage;
    Integer lastOilChangeKm;
    VehicleStatus status;
    String description;
    OffsetDateTime createdAt;
    OffsetDateTime updatedAt;
}
