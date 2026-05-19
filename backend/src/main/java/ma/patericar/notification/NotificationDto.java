package ma.patericar.notification;

import java.time.LocalDateTime;

public record NotificationDto(
    Long id,
    String type,
    String title,
    String message,
    String linkUrl,
    String relatedEntityType,
    Long relatedEntityId,
    boolean read,
    LocalDateTime createdAt,
    LocalDateTime readAt
) {}
