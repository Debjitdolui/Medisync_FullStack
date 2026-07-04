package com.medisync.service;

import com.medisync.entity.Notification;
import com.medisync.entity.User;
import com.medisync.repository.NotificationRepository;
import com.medisync.repository.UserRepository;
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
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void testGetUserNotifications() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("user@mail.com");

        Notification n1 = new Notification();
        n1.setNotificationId(1L);
        Notification n2 = new Notification();
        n2.setNotificationId(2L);

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(notificationRepository.findByUserUserIdOrderByCreatedAtDesc(1L)).thenReturn(Arrays.asList(n1, n2));

        List<Notification> result = notificationService.getUserNotifications("user@mail.com");

        assertEquals(2, result.size());
        verify(notificationRepository).findByUserUserIdOrderByCreatedAtDesc(1L);
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
}
