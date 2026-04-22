package ma.patericar.vehicle;

import ma.patericar.vehicle.dto.CreateVehicleRequest;
import ma.patericar.vehicle.dto.UpdateVehicleRequest;
import ma.patericar.vehicle.dto.VehicleDto;

public final class VehicleMapper {

    private VehicleMapper() {}

    public static VehicleDto toDto(Vehicle v) {
        return VehicleDto.builder()
                .id(v.getId())
                .brand(v.getBrand())
                .model(v.getModel())
                .year(v.getYear())
                .licensePlate(v.getLicensePlate())
                .vin(v.getVin())
                .color(v.getColor())
                .category(v.getCategory())
                .transmission(v.getTransmission())
                .fuelType(v.getFuelType())
                .seats(v.getSeats())
                .doors(v.getDoors())
                .powerHp(v.getPowerHp())
                .engineCc(v.getEngineCc())
                .consumptionPer100km(v.getConsumptionPer100km())
                .pricePerDay(v.getPricePerDay())
                .pricePerWeek(v.getPricePerWeek())
                .pricePerMonth(v.getPricePerMonth())
                .deposit(v.getDeposit())
                .kmIncludedPerDay(v.getKmIncludedPerDay())
                .pricePerExtraKm(v.getPricePerExtraKm())
                .insuranceExpiry(v.getInsuranceExpiry())
                .registrationExpiry(v.getRegistrationExpiry())
                .technicalVisitExpiry(v.getTechnicalVisitExpiry())
                .currentMileage(v.getCurrentMileage())
                .lastOilChangeKm(v.getLastOilChangeKm())
                .status(v.getStatus())
                .description(v.getDescription())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    public static Vehicle toEntity(CreateVehicleRequest req) {
        return Vehicle.builder()
                .brand(req.getBrand())
                .model(req.getModel())
                .year(req.getYear())
                .licensePlate(req.getLicensePlate())
                .vin(req.getVin())
                .color(req.getColor())
                .category(req.getCategory())
                .transmission(req.getTransmission())
                .fuelType(req.getFuelType())
                .seats(req.getSeats())
                .doors(req.getDoors() != null ? req.getDoors() : 4)
                .powerHp(req.getPowerHp())
                .engineCc(req.getEngineCc())
                .consumptionPer100km(req.getConsumptionPer100km())
                .pricePerDay(req.getPricePerDay())
                .pricePerWeek(req.getPricePerWeek())
                .pricePerMonth(req.getPricePerMonth())
                .deposit(req.getDeposit())
                .kmIncludedPerDay(req.getKmIncludedPerDay() != null ? req.getKmIncludedPerDay() : 200)
                .pricePerExtraKm(req.getPricePerExtraKm())
                .insuranceExpiry(req.getInsuranceExpiry())
                .registrationExpiry(req.getRegistrationExpiry())
                .technicalVisitExpiry(req.getTechnicalVisitExpiry())
                .currentMileage(req.getCurrentMileage() != null ? req.getCurrentMileage() : 0)
                .lastOilChangeKm(req.getLastOilChangeKm())
                .status(VehicleStatus.AVAILABLE)
                .description(req.getDescription())
                .build();
    }

    public static void updateEntity(Vehicle vehicle, UpdateVehicleRequest req) {
        if (req.getBrand() != null)                vehicle.setBrand(req.getBrand());
        if (req.getModel() != null)                vehicle.setModel(req.getModel());
        if (req.getYear() != null)                 vehicle.setYear(req.getYear());
        if (req.getLicensePlate() != null)         vehicle.setLicensePlate(req.getLicensePlate());
        if (req.getVin() != null)                  vehicle.setVin(req.getVin());
        if (req.getColor() != null)                vehicle.setColor(req.getColor());
        if (req.getCategory() != null)             vehicle.setCategory(req.getCategory());
        if (req.getTransmission() != null)         vehicle.setTransmission(req.getTransmission());
        if (req.getFuelType() != null)             vehicle.setFuelType(req.getFuelType());
        if (req.getSeats() != null)                vehicle.setSeats(req.getSeats());
        if (req.getDoors() != null)                vehicle.setDoors(req.getDoors());
        if (req.getPowerHp() != null)              vehicle.setPowerHp(req.getPowerHp());
        if (req.getEngineCc() != null)             vehicle.setEngineCc(req.getEngineCc());
        if (req.getConsumptionPer100km() != null)  vehicle.setConsumptionPer100km(req.getConsumptionPer100km());
        if (req.getPricePerDay() != null)          vehicle.setPricePerDay(req.getPricePerDay());
        if (req.getPricePerWeek() != null)         vehicle.setPricePerWeek(req.getPricePerWeek());
        if (req.getPricePerMonth() != null)        vehicle.setPricePerMonth(req.getPricePerMonth());
        if (req.getDeposit() != null)              vehicle.setDeposit(req.getDeposit());
        if (req.getKmIncludedPerDay() != null)     vehicle.setKmIncludedPerDay(req.getKmIncludedPerDay());
        if (req.getPricePerExtraKm() != null)      vehicle.setPricePerExtraKm(req.getPricePerExtraKm());
        if (req.getInsuranceExpiry() != null)      vehicle.setInsuranceExpiry(req.getInsuranceExpiry());
        if (req.getRegistrationExpiry() != null)   vehicle.setRegistrationExpiry(req.getRegistrationExpiry());
        if (req.getTechnicalVisitExpiry() != null) vehicle.setTechnicalVisitExpiry(req.getTechnicalVisitExpiry());
        if (req.getCurrentMileage() != null)       vehicle.setCurrentMileage(req.getCurrentMileage());
        if (req.getLastOilChangeKm() != null)      vehicle.setLastOilChangeKm(req.getLastOilChangeKm());
        if (req.getStatus() != null)               vehicle.setStatus(req.getStatus());
        if (req.getDescription() != null)          vehicle.setDescription(req.getDescription());
    }
}
