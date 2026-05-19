package ma.patericar.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification notifyAdmins(String type, String title, String message,
                                     String linkUrl, String entityType, Long entityId) {
        Notification notif = Notification.builder()
            .recipientType("ADMIN")
            .recipientUserId(null)
            .type(type)
            .title(title)
            .message(message)
            .linkUrl(linkUrl)
            .relatedEntityType(entityType)
            .relatedEntityId(entityId)
            .read(false)
            .build();
        return notificationRepository.save(notif);
    }

    public Notification notifyClient(Long clientUserId, String type, String title,
                                     String message, String linkUrl,
                                     String entityType, Long entityId) {
        Notification notif = Notification.builder()
            .recipientType("CLIENT")
            .recipientUserId(clientUserId)
            .type(type)
            .title(title)
            .message(message)
            .linkUrl(linkUrl)
            .relatedEntityType(entityType)
            .relatedEntityId(entityId)
            .read(false)
            .build();
        return notificationRepository.save(notif);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForAdmin(Long userId, int limit) {
        return notificationRepository
            .findForAdmin(userId, PageRequest.of(0, limit))
            .map(this::toDto)
            .getContent();
    }

    @Transactional(readOnly = true)
    public long countUnreadForAdmin(Long userId) {
        return notificationRepository.countUnreadForAdmin(userId);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> listForClient(Long userId, int limit) {
        return notificationRepository
            .findByRecipientTypeAndRecipientUserIdOrderByCreatedAtDesc(
                "CLIENT", userId, PageRequest.of(0, limit))
            .map(this::toDto)
            .getContent();
    }

    @Transactional(readOnly = true)
    public long countUnreadForClient(Long userId) {
        return notificationRepository
            .countByRecipientTypeAndRecipientUserIdAndReadFalse("CLIENT", userId);
    }

    public void markAsRead(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                n.setReadAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsReadForAdmin(Long userId) {
        notificationRepository.findForAdmin(userId, PageRequest.of(0, 200))
            .forEach(n -> {
                if (!n.isRead()) {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                    notificationRepository.save(n);
                }
            });
    }

    public void markAllAsReadForClient(Long userId) {
        notificationRepository.findByRecipientTypeAndRecipientUserIdOrderByCreatedAtDesc(
            "CLIENT", userId, PageRequest.of(0, 200))
            .forEach(n -> {
                if (!n.isRead()) {
                    n.setRead(true);
                    n.setReadAt(LocalDateTime.now());
                    notificationRepository.save(n);
                }
            });
    }

    private NotificationDto toDto(Notification n) {
        return new NotificationDto(
            n.getId(),
            n.getType(),
            n.getTitle(),
            n.getMessage(),
            n.getLinkUrl(),
            n.getRelatedEntityType(),
            n.getRelatedEntityId(),
            n.isRead(),
            n.getCreatedAt(),
            n.getReadAt()
        );
    }
}
