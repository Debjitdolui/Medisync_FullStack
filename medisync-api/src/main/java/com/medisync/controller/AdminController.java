package com.medisync.controller;

import com.medisync.entity.*;
import com.medisync.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/pharmacies")
    public ResponseEntity<Page<Pharmacy>> getAllPharmacies(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllPharmacies(pageable));
    }

    @GetMapping("/nurses")
    public ResponseEntity<Page<Nurse>> getAllNurses(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllNurses(pageable));
    }

    @PutMapping("/pharmacies/{id}/approve")
    public ResponseEntity<?> approvePharmacy(Authentication auth, @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(adminService.approvePharmacy(id, status, auth.getName()));
    }

    @PutMapping("/pharmacies/{id}/block")
    public ResponseEntity<?> blockPharmacy(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockPharmacy(id, auth.getName()));
    }

    @PutMapping("/pharmacies/{id}/unblock")
    public ResponseEntity<?> unblockPharmacy(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.unblockPharmacy(id, auth.getName()));
    }

    @PutMapping("/nurses/{id}/approve")
    public ResponseEntity<?> approveNurse(Authentication auth, @PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(adminService.approveNurse(id, status, auth.getName()));
    }

    @PutMapping("/nurses/{id}/block")
    public ResponseEntity<?> blockNurse(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.blockNurse(id, auth.getName()));
    }

    @PutMapping("/nurses/{id}/unblock")
    public ResponseEntity<?> unblockNurse(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(adminService.unblockNurse(id, auth.getName()));
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
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
    public ResponseEntity<Page<AdminActivityLog>> getLogs(Pageable pageable) {
        return ResponseEntity.ok(adminService.getLogs(pageable));
    }

    @GetMapping("/reports")
    public ResponseEntity<?> getReports() {
        return ResponseEntity.ok(adminService.getReports());
    }
}
