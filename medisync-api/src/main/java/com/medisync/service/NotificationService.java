package com.medisync.service;

import com.medisync.entity.Notification;
import com.medisync.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
    }

    public Page<Notification> getUserNotifications(String email, Pageable pageable) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email, pageable);
    }

    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByRecipientEmailAndIsReadFalse(email);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    /**
     * Create a notification for any recipient (user, nurse, or pharmacy).
     */
    public Notification createNotification(String recipientEmail, String recipientType, String type, String title, String message) {
        Notification notification = new Notification();
        notification.setRecipientEmail(recipientEmail);
        notification.setRecipientType(recipientType);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    /**
     * Convenience: notify a user (customer)
     */
    public void notifyUser(String email, String type, String title, String message) {
        createNotification(email, "user", type, title, message);
    }

    /**
     * Convenience: notify a nurse
     */
    public void notifyNurse(String email, String type, String title, String message) {
        createNotification(email, "nurse", type, title, message);
    }

    /**
     * Convenience: notify a pharmacy
     */
    public void notifyPharmacy(String email, String type, String title, String message) {
        createNotification(email, "pharmacy", type, title, message);
    }
}
