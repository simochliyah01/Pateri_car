package ma.patericar.client;

import lombok.RequiredArgsConstructor;
import ma.patericar.common.exceptions.ConflictException;
import ma.patericar.common.exceptions.ResourceNotFoundException;
import ma.patericar.reservation.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final ReservationRepository reservationRepository;

    public List<ClientDto> getAll() {
        return clientRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public ClientDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public ClientDto create(UpsertClientRequest req) {
        if (req.email() != null && !req.email().isBlank()
                && clientRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email déjà utilisé par un autre client");
        }
        if (req.cinPassport() != null && !req.cinPassport().isBlank()
                && clientRepository.existsByCinPassport(req.cinPassport())) {
            throw new ConflictException("CIN / Passeport déjà enregistré");
        }
        Client c = Client.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .cinPassport(req.cinPassport())
                .dateOfBirth(req.dateOfBirth())
                .phone(req.phone())
                .email(req.email())
                .address(req.address())
                .city(req.city())
                .status(req.status() != null ? req.status() : ClientStatus.ACTIVE)
                .isBlacklisted(false)
                .build();
        return toDto(clientRepository.save(c));
    }

    public ClientDto update(Long id, UpsertClientRequest req) {
        Client c = findOrThrow(id);
        if (req.email() != null && !req.email().isBlank()
                && !req.email().equals(c.getEmail())
                && clientRepository.existsByEmail(req.email())) {
            throw new ConflictException("Email déjà utilisé par un autre client");
        }
        if (req.cinPassport() != null && !req.cinPassport().isBlank()
                && !req.cinPassport().equals(c.getCinPassport())
                && clientRepository.existsByCinPassport(req.cinPassport())) {
            throw new ConflictException("CIN / Passeport déjà enregistré");
        }
        c.setFirstName(req.firstName());
        c.setLastName(req.lastName());
        c.setCinPassport(req.cinPassport());
        c.setDateOfBirth(req.dateOfBirth());
        c.setPhone(req.phone());
        c.setEmail(req.email());
        c.setAddress(req.address());
        c.setCity(req.city());
        if (req.status() != null) c.setStatus(req.status());
        return toDto(clientRepository.save(c));
    }

    public void delete(Long id) {
        Client c = findOrThrow(id);
        long resCount = reservationRepository.countByClientId(id);
        if (resCount > 0) {
            throw new ConflictException(
                    "Ce client possède " + resCount + " réservation(s). Suppression impossible.");
        }
        clientRepository.delete(c);
    }

    public ClientDto updateStatus(Long id, ClientStatus status) {
        Client c = findOrThrow(id);
        c.setStatus(status);
        return toDto(clientRepository.save(c));
    }

    public ClientDto setBlacklist(Long id, boolean blacklisted, String reason) {
        Client c = findOrThrow(id);
        c.setIsBlacklisted(blacklisted);
        c.setBlacklistReason(blacklisted ? reason : null);
        if (blacklisted) c.setStatus(ClientStatus.BLOCKED);
        return toDto(clientRepository.save(c));
    }

    private Client findOrThrow(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable: " + id));
    }

    private ClientDto toDto(Client c) {
        return new ClientDto(
                c.getId(), c.getFirstName(), c.getLastName(),
                c.getCinPassport(), c.getDateOfBirth(),
                c.getPhone(), c.getEmail(), c.getAddress(), c.getCity(),
                c.getStatus(), c.getIsBlacklisted(), c.getBlacklistReason(),
                c.getCreatedAt(), c.getUpdatedAt(),
                reservationRepository.countByClientId(c.getId()));
    }
}
