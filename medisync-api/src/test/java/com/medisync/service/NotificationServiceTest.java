package com.medisync.service;

import com.medisync.entity.Notification;
import com.medisync.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void testGetUserNotifications() {
        Notification n1 = new Notification();
        n1.setNotificationId(1L);
        n1.setRecipientEmail("user@mail.com");
        Notification n2 = new Notification();
        n2.setNotificationId(2L);
        n2.setRecipientEmail("user@mail.com");

        when(notificationRepository.findByRecipientEmailOrderByCreatedAtDesc("user@mail.com"))
                .thenReturn(Arrays.asList(n1, n2));

        List<Notification> result = notificationService.getUserNotifications("user@mail.com");

        assertEquals(2, result.size());
        verify(notificationRepository).findByRecipientEmailOrderByCreatedAtDesc("user@mail.com");
    }

    @Test
    void testMarkAsRead() {
        Notification notification = new Notification();
        notification.setNotificationId(1L);
        notification.setIsRead(false);

        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        Notification result = notificationService.markAsRead(1L);

        assertTrue(result.getIsRead());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void testMarkAllAsRead() {
        Notification n1 = new Notification();
        n1.setIsRead(false);
        Notification n2 = new Notification();
        n2.setIsRead(false);

        when(notificationRepository.findByRecipientEmailAndIsReadFalse("user@mail.com"))
                .thenReturn(Arrays.asList(n1, n2));

        int count = notificationService.markAllAsRead("user@mail.com");

        assertEquals(2, count);
        assertTrue(n1.getIsRead());
        assertTrue(n2.getIsRead());
    }

    @Test
    void testCreateNotification() {
        Notification saved = new Notification();
        saved.setNotificationId(1L);
        saved.setRecipientEmail("nurse@mail.com");
        saved.setRecipientType("nurse");
        saved.setType("NEW_REQUEST");
        saved.setTitle("New Request");
        saved.setMessage("You have a new request");

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        Notification result = notificationService.createNotification("nurse@mail.com", "nurse", "NEW_REQUEST", "New Request", "You have a new request");

        assertEquals("nurse@mail.com", result.getRecipientEmail());
        assertEquals("nurse", result.getRecipientType());
        verify(notificationRepository).save(any(Notification.class));
    }
}
