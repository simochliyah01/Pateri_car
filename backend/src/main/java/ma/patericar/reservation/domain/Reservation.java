package ma.patericar.reservation.domain;

import jakarta.persistence.*;
import lombok.*;
import ma.patericar.client.Client;
import ma.patericar.user.User;
import ma.patericar.vehicle.Vehicle;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reservations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reservation_number", unique = true, nullable = false, length = 20)
    private String reservationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commercial_id")
    private User commercial;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_location", nullable = false, length = 20)
    private PickupLocation pickupLocation;

    @Column(name = "pickup_address", columnDefinition = "TEXT")
    private String pickupAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_location", nullable = false, length = 20)
    private PickupLocation returnLocation;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "options_price", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal optionsPrice = BigDecimal.ZERO;

    @Column(name = "delivery_fee", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    @Builder.Default
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "departure_mileage")
    private Integer departureMileage;

    @Column(name = "return_mileage")
    private Integer returnMileage;

    @Column(name = "departure_fuel_level", precision = 3, scale = 2)
    private BigDecimal departureFuelLevel;

    @Column(name = "return_fuel_level", precision = 3, scale = 2)
    private BigDecimal returnFuelLevel;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    @Column(name = "contract_pdf_path", length = 500)
    private String contractPdfPath;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReservationOption> options = new ArrayList<>();

    public void addOption(ReservationOption option) {
        options.add(option);
        option.setReservation(this);
    }
}
