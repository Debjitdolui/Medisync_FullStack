package com.medisync.controller;

import com.medisync.dto.AuthResponse;
import com.medisync.dto.LoginRequest;
import com.medisync.dto.NurseRegisterRequest;
import com.medisync.service.AuthService;
import com.medisync.service.NurseModuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nurses")
@RequiredArgsConstructor
public class NurseController {

    private final NurseModuleService nurseModuleService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.loginNurse(req));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody NurseRegisterRequest req) {
        return ResponseEntity.ok(nurseModuleService.register(req));
    }

    @PutMapping("/availability")
    public ResponseEntity<?> updateAvailability(Authentication auth, @RequestParam String status) {
        return ResponseEntity.ok(nurseModuleService.updateAvailability(auth.getName(), status));
    }

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableNurses() {
        return ResponseEntity.ok(nurseModuleService.getAvailableNurses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNurseById(@PathVariable Long id) {
        return ResponseEntity.ok(nurseModuleService.getNurseById(id));
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServices() {
        return ResponseEntity.ok(nurseModuleService.getServices());
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(nurseModuleService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(nurseModuleService.updateProfile(auth.getName(), body));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody java.util.Map<String, String> body) {
        nurseModuleService.changePassword(auth.getName(), body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
    }
}
