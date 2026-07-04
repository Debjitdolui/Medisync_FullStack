package com.medisync.controller;

import com.medisync.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pharmacies")
    public ResponseEntity<?> getAllPharmacies() {
        return ResponseEntity.ok(adminService.getAllPharmacies());
    }

    @GetMapping("/nurses")
    public ResponseEntity<?> getAllNurses() {
        return ResponseEntity.ok(adminService.getAllNurses());
    }

    @PutMapping("/pharmacies/{id}/approve")
    public ResponseEntity<?> approvePharmacy(Authentication auth, @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(adminService.approvePharmacy(id, status, auth.getName()));
    }

    @PutMapping("/nurses/{id}/approve")
    public ResponseEntity<?> approveNurse(Authentication auth, @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(adminService.approveNurse(id, status, auth.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockUser(id, auth.getName()));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.unblockUser(id, auth.getName()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs() {
        return ResponseEntity.ok(adminService.getLogs());
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }
}
