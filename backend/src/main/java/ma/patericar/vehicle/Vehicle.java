package ma.patericar.vehicle;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "vehicles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String brand;

    @Column(nullable = false, length = 100)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(unique = true, length = 50)
    private String vin;

    @Column(length = 30)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VehicleCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 15)
    private FuelType fuelType;

    @Column(nullable = false)
    private Integer seats;

    @Column(columnDefinition = "INTEGER DEFAULT 4")
    private Integer doors;

    @Column(name = "power_hp")
    private Integer powerHp;

    @Column(name = "engine_cc")
    private Integer engineCc;

    @Column(name = "consumption_per_100km", precision = 4, scale = 2)
    private BigDecimal consumptionPer100km;

    @Column(name = "price_per_day", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "price_per_week", precision = 10, scale = 2)
    private BigDecimal pricePerWeek;

    @Column(name = "price_per_month", precision = 10, scale = 2)
    private BigDecimal pricePerMonth;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal deposit;

    @Column(name = "km_included_per_day")
    private Integer kmIncludedPerDay;

    @Column(name = "price_per_extra_km", precision = 6, scale = 2)
    private BigDecimal pricePerExtraKm;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "registration_expiry")
    private LocalDate registrationExpiry;

    @Column(name = "technical_visit_expiry")
    private LocalDate technicalVisitExpiry;

    @Column(name = "current_mileage")
    private Integer currentMileage;

    @Column(name = "last_oil_change_km")
    private Integer lastOilChangeKm;

    @Enumerated(EnumType.STRING)
    @Column(length = 15, columnDefinition = "VARCHAR(15) DEFAULT 'AVAILABLE'")
    private VehicleStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
