package ma.patericar.notification;

import lombok.RequiredArgsConstructor;
import ma.patericar.user.User;
import ma.patericar.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
            Authentication authentication,
            @RequestParam(defaultValue = "20") int limit) {

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(notificationService.listForAdmin(user.getId(), limit));
        }
        return ResponseEntity.ok(notificationService.listForClient(user.getId(), limit));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        long count = isAdmin(authentication)
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
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (isAdmin(authentication)) {
            notificationService.markAllAsReadForAdmin(user.getId());
        } else {
            notificationService.markAllAsReadForClient(user.getId());
        }
        return ResponseEntity.noContent().build();
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) return false;
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String role = authority.getAuthority();
            if (role.equals("ROLE_ADMIN")
                    || role.equals("ROLE_GERANT")
                    || role.equals("ROLE_COMMERCIAL")
                    || role.equals("ROLE_COMPTABLE")) {
                return true;
            }
        }
        return false;
    }
}
