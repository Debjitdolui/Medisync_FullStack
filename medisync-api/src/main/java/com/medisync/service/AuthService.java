package com.medisync.service;

import com.medisync.config.JwtService;
import com.medisync.dto.*;
import com.medisync.entity.PasswordReset;
import com.medisync.entity.User;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepo;
    private final PharmacyRepository pharmacyRepo;
    private final NurseRepository nurseRepo;
    private final PasswordResetRepository resetRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        if (userRepo.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole("customer");
        user.setStatus("active");
        user.setIsActive(true);
        userRepo.save(user);

        String token = jwtService.generateToken(user.getEmail(), "customer");
        return new AuthResponse(token, "customer", user.getUsername(), user.getEmail());
    }

    public AuthResponse login(LoginRequest req) {
        // Check users table
        var user = userRepo.findByEmail(req.getEmail());
        if (user.isPresent()) {
            if (!encoder.matches(req.getPassword(), user.get().getPasswordHash()))
                throw new RuntimeException("Invalid credentials");
            if (!user.get().getIsActive())
                throw new RuntimeException("Account is deactivated");

            String token = jwtService.generateToken(user.get().getEmail(), user.get().getRole());
            return new AuthResponse(token, user.get().getRole(), user.get().getUsername(), user.get().getEmail());
        }

        // Check pharmacies table
        var pharmacy = pharmacyRepo.findByEmail(req.getEmail());
        if (pharmacy.isPresent()) {
            if (!encoder.matches(req.getPassword(), pharmacy.get().getPasswordHash()))
                throw new RuntimeException("Invalid credentials");
            if (!"approved".equals(pharmacy.get().getApprovalStatus()))
                throw new RuntimeException("Pharmacy account is pending admin approval");

            String token = jwtService.generateToken(pharmacy.get().getEmail(), "pharmacy");
            return new AuthResponse(token, "pharmacy", pharmacy.get().getOwnerName(), pharmacy.get().getEmail());
        }

        // Check nurses table
        var nurse = nurseRepo.findByEmail(req.getEmail());
        if (nurse.isPresent()) {
            if (!encoder.matches(req.getPassword(), nurse.get().getPasswordHash()))
                throw new RuntimeException("Invalid credentials");
            if (!"approved".equals(nurse.get().getApprovalStatus()))
                throw new RuntimeException("Nurse account is pending admin approval");

            String token = jwtService.generateToken(nurse.get().getEmail(), "nurse");
            return new AuthResponse(token, "nurse", nurse.get().getFullName(), nurse.get().getEmail());
        }

        throw new RuntimeException("Invalid credentials");
    }

    public AuthResponse loginPharmacy(LoginRequest req) {
        var pharmacy = pharmacyRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), pharmacy.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");
        if (!"approved".equals(pharmacy.getApprovalStatus()))
            throw new RuntimeException("Pharmacy account is pending admin approval");

        String token = jwtService.generateToken(pharmacy.getEmail(), "pharmacy");
        return new AuthResponse(token, "pharmacy", pharmacy.getOwnerName(), pharmacy.getEmail());
    }

    public AuthResponse loginNurse(LoginRequest req) {
        var nurse = nurseRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), nurse.getPasswordHash()))
            throw new RuntimeException("Invalid credentials");
        if (!"approved".equals(nurse.getApprovalStatus()))
            throw new RuntimeException("Nurse account is pending admin approval");

        String token = jwtService.generateToken(nurse.getEmail(), "nurse");
        return new AuthResponse(token, "nurse", nurse.getFullName(), nurse.getEmail());
    }

    public String forgotPassword(ForgotPasswordRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = String.format("%06d", new Random().nextInt(999999));
        PasswordReset reset = new PasswordReset();
        reset.setUser(user);
        reset.setOtpCode(otp);
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        reset.setIsUsed(false);
        resetRepo.save(reset);

        // TODO: Send OTP via email in production
        return "OTP sent to " + req.getEmail() + " (OTP: " + otp + ")";
    }

    public String resetPassword(ResetPasswordRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not found"));

        PasswordReset reset = resetRepo.findTopByUserUserIdAndIsUsedFalseOrderByCreatedAtDesc(user.getUserId())
                .orElseThrow(() -> new RuntimeException("No OTP request found"));

        if (reset.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");
        if (!reset.getOtpCode().equals(req.getOtp()))
            throw new RuntimeException("Invalid OTP");

        reset.setIsUsed(true);
        resetRepo.save(reset);

        user.setPasswordHash(encoder.encode(req.getNewPassword()));
        userRepo.save(user);
        return "Password reset successful";
    }
}
