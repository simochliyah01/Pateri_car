package ma.patericar.client;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    public List<ClientDto> getAll() {
        return clientService.getAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT', 'COMMERCIAL')")
    public ClientDto getById(@PathVariable Long id) {
        return clientService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<ClientDto> create(@Valid @RequestBody UpsertClientRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ClientDto update(@PathVariable Long id, @Valid @RequestBody UpsertClientRequest req) {
        return clientService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ClientDto updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        ClientStatus status = ClientStatus.valueOf(body.get("status"));
        return clientService.updateStatus(id, status);
    }

    @PatchMapping("/{id}/blacklist")
    @PreAuthorize("hasAnyRole('ADMIN', 'GERANT')")
    public ClientDto setBlacklist(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean blacklisted = Boolean.TRUE.equals(body.get("blacklisted"));
        String reason = (String) body.get("reason");
        return clientService.setBlacklist(id, blacklisted, reason);
    }
}
