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
            if (Boolean.TRUE.equals(pharmacy.get().getIsBlocked()))
                throw new RuntimeException("Account has been blocked. Contact support.");
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
            if (Boolean.TRUE.equals(nurse.get().getIsBlocked()))
                throw new RuntimeException("Account has been blocked. Contact support.");
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
        if (Boolean.TRUE.equals(pharmacy.getIsBlocked()))
            throw new RuntimeException("Account has been blocked. Contact support.");
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
        if (Boolean.TRUE.equals(nurse.getIsBlocked()))
            throw new RuntimeException("Account has been blocked. Contact support.");
        if (!"approved".equals(nurse.getApprovalStatus()))
            throw new RuntimeException("Nurse account is pending admin approval");

        String token = jwtService.generateToken(nurse.getEmail(), "nurse");
        return new AuthResponse(token, "nurse", nurse.getFullName(), nurse.getEmail());
    }

    public String forgotPassword(ForgotPasswordRequest req) {
        // Determine which entity type this email belongs to
        String entityType = resolveEntityType(req.getEmail());

        String otp = String.format("%06d", new Random().nextInt(999999));
        PasswordReset reset = new PasswordReset();
        reset.setEmail(req.getEmail());
        reset.setEntityType(entityType);
        reset.setOtpCode(otp);
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        reset.setIsUsed(false);
        resetRepo.save(reset);

        // TODO: Send OTP via email in production
        return "OTP sent to " + req.getEmail() + " (OTP: " + otp + ")";
    }

    public String resetPassword(ResetPasswordRequest req) {
        PasswordReset reset = resetRepo.findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(req.getEmail())
                .orElseThrow(() -> new RuntimeException("No OTP request found"));

        if (reset.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");
        if (!reset.getOtpCode().equals(req.getOtp()))
            throw new RuntimeException("Invalid OTP");

        reset.setIsUsed(true);
        resetRepo.save(reset);

        // Update password in the correct table based on entity type
        String newHash = encoder.encode(req.getNewPassword());
        switch (reset.getEntityType()) {
            case "user" -> {
                var user = userRepo.findByEmail(req.getEmail())
                        .orElseThrow(() -> new RuntimeException("User not found"));
                user.setPasswordHash(newHash);
                userRepo.save(user);
            }
            case "pharmacy" -> {
                var pharmacy = pharmacyRepo.findByEmail(req.getEmail())
                        .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
                pharmacy.setPasswordHash(newHash);
                pharmacyRepo.save(pharmacy);
            }
            case "nurse" -> {
                var nurse = nurseRepo.findByEmail(req.getEmail())
                        .orElseThrow(() -> new RuntimeException("Nurse not found"));
                nurse.setPasswordHash(newHash);
                nurseRepo.save(nurse);
            }
            default -> throw new RuntimeException("Unknown entity type");
        }

        return "Password reset successful";
    }

    /**
     * Resolves which table the email belongs to: user, pharmacy, or nurse.
     * Throws RuntimeException if email not found in any table.
     */
    private String resolveEntityType(String email) {
        if (userRepo.findByEmail(email).isPresent()) return "user";
        if (pharmacyRepo.findByEmail(email).isPresent()) return "pharmacy";
        if (nurseRepo.findByEmail(email).isPresent()) return "nurse";
        throw new RuntimeException("Email not found");
    }
}
