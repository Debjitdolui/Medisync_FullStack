package com.medisync.service;

import com.medisync.dto.LoginRequest;
import com.medisync.dto.RegisterRequest;
import com.medisync.dto.AuthResponse;
import com.medisync.entity.User;
import com.medisync.repository.UserRepository;
import com.medisync.repository.PharmacyRepository;
import com.medisync.repository.NurseRepository;
import com.medisync.repository.PasswordResetRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepo;
    @Mock private PharmacyRepository pharmacyRepo;
    @Mock private NurseRepository nurseRepo;
    @Mock private PasswordResetRepository resetRepo;
    @Mock private PasswordEncoder encoder;

    @InjectMocks private AuthService authService;

    @Test
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setUsername("testuser");
        request.setPassword("password123");
        request.setPhone("1234567890");

        User savedUser = new User();
        savedUser.setUserId(1L);
        savedUser.setEmail("test@example.com");
        savedUser.setUsername("testuser");
        savedUser.setRole("customer");

        when(userRepo.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepo.existsByUsername("testuser")).thenReturn(false);
        when(encoder.encode("password123")).thenReturn("hashed");
        when(userRepo.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertEquals("registered", response.getToken());
        assertEquals("customer", response.getRole());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void testRegister_EmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepo.existsByEmail("test@example.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    void testRegister_UsernameExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setUsername("testuser");

        when(userRepo.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepo.existsByUsername("testuser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(request));
        assertEquals("Username already taken", ex.getMessage());
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashed");
        user.setRole("customer");
        user.setIsActive(true);

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("password123", "hashed")).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertEquals("login-success", response.getToken());
        assertEquals("customer", response.getRole());
    }

    @Test
    void testLogin_InvalidPassword() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongpass");

        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");
        user.setPasswordHash("hashed");
        user.setRole("customer");
        user.setIsActive(true);

        when(userRepo.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrongpass", "hashed")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertEquals("Invalid credentials", ex.getMessage());
    }
}
