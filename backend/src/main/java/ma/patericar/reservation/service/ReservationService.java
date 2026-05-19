package ma.patericar.reservation.service;

import lombok.RequiredArgsConstructor;
import ma.patericar.client.Client;
import ma.patericar.client.ClientRepository;
import ma.patericar.common.exceptions.InvalidReservationException;
import ma.patericar.common.exceptions.InvalidStatusTransitionException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.common.exceptions.VehicleNotAvailableException;
import ma.patericar.notification.NotificationService;
import ma.patericar.reservation.domain.PickupLocation;
import ma.patericar.reservation.domain.Reservation;
import ma.patericar.reservation.domain.ReservationOption;
import ma.patericar.reservation.domain.ReservationStatus;
import ma.patericar.reservation.dto.AvailabilityCheckRequest;
import ma.patericar.reservation.dto.AvailabilityResponse;
import ma.patericar.reservation.dto.CreateReservationRequest;
import ma.patericar.reservation.dto.ReservationDto;
import ma.patericar.reservation.mapper.ReservationMapper;
import ma.patericar.reservation.repository.ReservationRepository;
import ma.patericar.user.User;
import ma.patericar.user.UserRepository;
import ma.patericar.vehicle.Vehicle;
import ma.patericar.vehicle.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReservationService {

    private static final BigDecimal DELIVERY_FEE_GARE     = new BigDecimal("50.00");
    private static final BigDecimal DELIVERY_FEE_DOMICILE = new BigDecimal("100.00");

    private final ReservationRepository      reservationRepository;
    private final ClientRepository           clientRepository;
    private final UserRepository             userRepository;
    private final VehicleRepository          vehicleRepository;
    private final ReservationMapper          mapper;
    private final ReservationNumberGenerator numberGenerator;
    private final NotificationService        notificationService;

    @Transactional
    public ReservationDto create(CreateReservationRequest req, User currentUser) {
        if (!req.endDate().isAfter(req.startDate())) {
            throw new InvalidReservationException("End date must be after start date");
        }

        Client client;
        if (req.clientId() != null) {
            // Admin/staff creating on behalf of a client
            client = clientRepository.findById(req.clientId())
                .orElseThrow(() -> ResourceNotFoundException.of("Client", req.clientId()));
        } else {
            // Self-service: CLIENT user — look up by authenticated email
            client = clientRepository.findByEmail(currentUser.getEmail())
                .orElseThrow(() -> new InvalidReservationException(
                    "Profil client introuvable pour " + currentUser.getEmail()));
        }

        if (Boolean.TRUE.equals(client.getIsBlacklisted())) {
            throw new InvalidReservationException("Client is blacklisted and cannot make reservations");
        }

        // Backfill phone on client and user records if it was missing
        if (req.clientPhone() != null && !req.clientPhone().isBlank()) {
            if (client.getPhone() == null || client.getPhone().isBlank()) {
                client.setPhone(req.clientPhone());
                clientRepository.save(client);
            }
            if (currentUser.getPhone() == null || currentUser.getPhone().isBlank()) {
                currentUser.setPhone(req.clientPhone());
                userRepository.save(currentUser);
            }
        }

        Vehicle vehicle = vehicleRepository.findById(req.vehicleId())
            .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", req.vehicleId()));

        List<Reservation> conflicts = reservationRepository.findOverlappingReservations(
            vehicle.getId(), req.startDate(), req.endDate());
        if (!conflicts.isEmpty()) {
            throw new VehicleNotAvailableException(vehicle.getId(), req.startDate(), req.endDate());
        }

        int days = (int) ChronoUnit.DAYS.between(req.startDate(), req.endDate());
        BigDecimal basePrice = vehicle.getPricePerDay().multiply(BigDecimal.valueOf(days));

        List<ReservationOption> options = new ArrayList<>();
        BigDecimal optionsPrice = BigDecimal.ZERO;

        if (req.options() != null) {
            for (CreateReservationRequest.OptionRequest optReq : req.options()) {
                BigDecimal pricePerDay   = OptionPricing.getPriceFor(optReq.optionType());
                BigDecimal totalOptPrice = pricePerDay.multiply(BigDecimal.valueOf(days));
                options.add(ReservationOption.builder()
                    .optionType(optReq.optionType())
                    .pricePerDay(pricePerDay)
                    .totalPrice(totalOptPrice)
                    .build());
                optionsPrice = optionsPrice.add(totalOptPrice);
            }
        }

        BigDecimal deliveryFee = switch (req.pickupLocation()) {
            case GARE     -> DELIVERY_FEE_GARE;
            case DOMICILE -> DELIVERY_FEE_DOMICILE;
            case AGENCE   -> BigDecimal.ZERO;
        };

        BigDecimal totalPrice = basePrice.add(optionsPrice).add(deliveryFee);

        PickupLocation returnLoc = req.returnLocation() != null
            ? req.returnLocation() : req.pickupLocation();

        Reservation reservation = Reservation.builder()
            .reservationNumber(numberGenerator.generate())
            .client(client)
            .vehicle(vehicle)
            .commercial(currentUser)
            .startDate(req.startDate())
            .endDate(req.endDate())
            .durationDays(days)
            .pickupLocation(req.pickupLocation())
            .returnLocation(returnLoc)
            .pickupAddress(req.pickupAddress())
            .basePrice(basePrice)
            .optionsPrice(optionsPrice)
            .deliveryFee(deliveryFee)
            .totalPrice(totalPrice)
            .internalNotes(req.internalNotes())
            .build();

        Reservation saved = reservationRepository.save(reservation);
        options.forEach(saved::addOption);
        Reservation finalSaved = reservationRepository.save(saved);

        notificationService.notifyAdmins(
            "RESERVATION_CREATED",
            "Nouvelle réservation",
            String.format("%s a réservé %s %s pour %d jour(s) — %.0f DH",
                client.getFirstName() + " " + client.getLastName(),
                vehicle.getBrand(),
                vehicle.getModel(),
                days,
                totalPrice.doubleValue()),
            "/admin/reservations",
            "RESERVATION",
            finalSaved.getId()
        );

        return mapper.toDto(finalSaved);
    }

    public AvailabilityResponse checkAvailability(Long vehicleId, AvailabilityCheckRequest req) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
            .orElseThrow(() -> ResourceNotFoundException.of("Vehicle", vehicleId));

        List<Reservation> conflicts = reservationRepository.findOverlappingReservations(
            vehicleId, req.startDate(), req.endDate());

        int days = (int) ChronoUnit.DAYS.between(req.startDate(), req.endDate());
        BigDecimal estimatedTotal = vehicle.getPricePerDay().multiply(BigDecimal.valueOf(days));

        List<AvailabilityResponse.DateRange> conflictDates = conflicts.stream()
            .map(r -> new AvailabilityResponse.DateRange(r.getStartDate(), r.getEndDate()))
            .toList();

        return new AvailabilityResponse(
            vehicleId,
            conflicts.isEmpty(),
            days,
            vehicle.getPricePerDay(),
            estimatedTotal,
            conflictDates
        );
    }

    public ReservationDto findById(Long id) {
        return reservationRepository.findById(id)
            .map(mapper::toDto)
            .orElseThrow(() -> ResourceNotFoundException.of("Reservation", id));
    }

    public List<ReservationDto> findByClientId(Long clientId) {
        return reservationRepository.findByClientIdOrderByCreatedAtDesc(clientId)
            .stream().map(mapper::toDto).toList();
    }

    public List<ReservationDto> findByCommercialId(Long userId) {
        return reservationRepository.findByCommercialIdOrderByCreatedAtDesc(userId)
            .stream().map(mapper::toDto).toList();
    }

    public List<ReservationDto> findByClientEmail(String email) {
        return reservationRepository.findByClient_EmailOrderByCreatedAtDesc(email)
            .stream().map(mapper::toDto).toList();
    }

    public Page<ReservationDto> findAll(Pageable pageable) {
        return reservationRepository.findAllByOrderByCreatedAtDesc(pageable)
            .map(mapper::toDto);
    }

    public Page<ReservationDto> findByStatus(ReservationStatus status, Pageable pageable) {
        return reservationRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            .map(mapper::toDto);
    }

    @Transactional
    public ReservationDto confirm(Long id) {
        Reservation r = reservationRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("Reservation", id));

        if (r.getStatus() != ReservationStatus.PENDING) {
            throw new InvalidStatusTransitionException(r.getStatus(), ReservationStatus.CONFIRMED);
        }

        r.setStatus(ReservationStatus.CONFIRMED);
        r.setConfirmedAt(OffsetDateTime.now());

        Reservation saved = reservationRepository.save(r);
        notificationService.notifyAdmins(
            "RESERVATION_CONFIRMED",
            "Réservation confirmée",
            String.format("La réservation %s a été confirmée", r.getReservationNumber()),
            "/admin/reservations",
            "RESERVATION",
            r.getId()
        );
        return mapper.toDto(saved);
    }

    @Transactional
    public ReservationDto cancel(Long id, String reason) {
        Reservation r = reservationRepository.findById(id)
            .orElseThrow(() -> ResourceNotFoundException.of("Reservation", id));

        if (r.getStatus() != ReservationStatus.PENDING
                && r.getStatus() != ReservationStatus.CONFIRMED) {
            throw new InvalidStatusTransitionException(r.getStatus(), ReservationStatus.CANCELLED);
        }

        r.setStatus(ReservationStatus.CANCELLED);

        String cancelNote = "[ANNULATION] " + reason;
        r.setInternalNotes(r.getInternalNotes() != null
            ? r.getInternalNotes() + "\n" + cancelNote
            : cancelNote);

        Reservation saved = reservationRepository.save(r);
        notificationService.notifyAdmins(
            "RESERVATION_CANCELLED",
            "Réservation annulée",
            String.format("La réservation %s a été annulée%s",
                r.getReservationNumber(),
                reason != null && !reason.isBlank() ? " — " + reason : ""),
            "/admin/reservations",
            "RESERVATION",
            r.getId()
        );
        return mapper.toDto(saved);
    }
}
