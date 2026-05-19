package ma.patericar.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.recipientType = 'ADMIN' " +
           "AND (n.recipientUserId IS NULL OR n.recipientUserId = :userId) " +
           "ORDER BY n.createdAt DESC")
    Page<Notification> findForAdmin(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipientType = 'ADMIN' " +
           "AND (n.recipientUserId IS NULL OR n.recipientUserId = :userId) " +
           "AND n.read = false")
    long countUnreadForAdmin(@Param("userId") Long userId);

    Page<Notification> findByRecipientTypeAndRecipientUserIdOrderByCreatedAtDesc(
        String recipientType, Long recipientUserId, Pageable pageable);

    long countByRecipientTypeAndRecipientUserIdAndReadFalse(
        String recipientType, Long recipientUserId);
}
