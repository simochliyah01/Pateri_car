package ma.patericar.notification;

import lombok.RequiredArgsConstructor;
import ma.patericar.user.User;
import ma.patericar.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationDto>> list(
            @AuthenticationPrincipal UserDetails principal,
            @RequestParam(defaultValue = "20") int limit) {

        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (isAdmin(user)) {
            return ResponseEntity.ok(notificationService.listForAdmin(user.getId(), limit));
        }
        return ResponseEntity.ok(notificationService.listForClient(user.getId(), limit));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        long count = isAdmin(user)
            ? notificationService.countUnreadForAdmin(user.getId())
            : notificationService.countUnreadForClient(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (isAdmin(user)) {
            notificationService.markAllAsReadForAdmin(user.getId());
        } else {
            notificationService.markAllAsReadForClient(user.getId());
        }
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
            .anyMatch(r -> r.getName().equals("ADMIN")
                       || r.getName().equals("GERANT")
                       || r.getName().equals("COMMERCIAL")
                       || r.getName().equals("COMPTABLE"));
    }
}
