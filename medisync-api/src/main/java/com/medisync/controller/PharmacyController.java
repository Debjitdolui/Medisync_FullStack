package com.medisync.controller;

import com.medisync.dto.AuthResponse;
import com.medisync.dto.LoginRequest;
import com.medisync.dto.PharmacyRegisterRequest;
import com.medisync.dto.PharmacyUpdateRequest;
import com.medisync.entity.Pharmacy;
import com.medisync.service.AuthService;
import com.medisync.service.PharmacyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacies")
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.loginPharmacy(req));
    }

    @PostMapping("/register")
    public ResponseEntity<Pharmacy> register(@Valid @RequestBody PharmacyRegisterRequest req) {
        return ResponseEntity.ok(pharmacyService.register(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pharmacy> getById(@PathVariable Long id) {
        return ResponseEntity.ok(pharmacyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pharmacy> update(@PathVariable Long id, @Valid @RequestBody PharmacyUpdateRequest req) {
        return ResponseEntity.ok(pharmacyService.update(id, req));
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        return ResponseEntity.ok(pharmacyService.getDashboard(auth.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Pharmacy>> listApproved() {
        return ResponseEntity.ok(pharmacyService.listApproved());
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody Map<String, String> body) {
        pharmacyService.changePassword(auth.getName(), body.get("currentPassword"), body.get("newPassword"));
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PutMapping("/toggle-status")
    public ResponseEntity<?> toggleOnlineStatus(Authentication auth) {
        Pharmacy pharmacy = pharmacyService.toggleOnlineStatus(auth.getName());
        return ResponseEntity.ok(Map.of(
                "isOnline", pharmacy.getIsOnline(),
                "message", pharmacy.getIsOnline() ? "Pharmacy is now Online" : "Pharmacy is now Offline"
        ));
    }
}
