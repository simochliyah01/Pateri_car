package ma.patericar.reservation.repository;

import ma.patericar.reservation.domain.Reservation;
import ma.patericar.reservation.domain.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByReservationNumber(String reservationNumber);

    List<Reservation> findByClientIdOrderByCreatedAtDesc(Long clientId);

    Page<Reservation> findByStatusOrderByCreatedAtDesc(ReservationStatus status, Pageable pageable);

    Page<Reservation> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.vehicle.id = :vehicleId
        AND r.status NOT IN (
            ma.patericar.reservation.domain.ReservationStatus.CANCELLED,
            ma.patericar.reservation.domain.ReservationStatus.COMPLETED)
        AND r.startDate < :endDate
        AND r.endDate > :startDate
        """)
    List<Reservation> findOverlappingReservations(
        @Param("vehicleId") Long vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    @Query("""
        SELECT r FROM Reservation r
        WHERE r.vehicle.id = :vehicleId
        AND r.id != :excludeId
        AND r.status NOT IN (
            ma.patericar.reservation.domain.ReservationStatus.CANCELLED,
            ma.patericar.reservation.domain.ReservationStatus.COMPLETED)
        AND r.startDate < :endDate
        AND r.endDate > :startDate
        """)
    List<Reservation> findOverlappingReservationsExcluding(
        @Param("vehicleId") Long vehicleId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("excludeId") Long excludeId
    );

    List<Reservation> findByCommercialIdOrderByCreatedAtDesc(Long commercialId);

    List<Reservation> findByClient_EmailOrderByCreatedAtDesc(String email);

    long countByClientId(Long clientId);

    long countByStatus(ReservationStatus status);
}
