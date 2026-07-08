package com.medisync.controller;

import com.medisync.entity.*;
import com.medisync.repository.NurseServiceRepository;
import com.medisync.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final NurseServiceRepository nurseServiceRepository;

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

    @GetMapping("/reports/users")
    public ResponseEntity<?> getUsersReport() {
        return ResponseEntity.ok(adminService.getUsersReportData());
    }

    @GetMapping("/reports/pharmacies")
    public ResponseEntity<?> getPharmaciesReport() {
        return ResponseEntity.ok(adminService.getPharmaciesReportData());
    }

    @GetMapping("/reports/nurses")
    public ResponseEntity<?> getNursesReport() {
        return ResponseEntity.ok(adminService.getNursesReportData());
    }

    // ─── Nurse Service Management ───────────────────────────────────────────────

    @GetMapping("/nurse-services")
    public ResponseEntity<List<NurseService>> getNurseServices() {
        return ResponseEntity.ok(nurseServiceRepository.findAll());
    }

    @PostMapping("/nurse-services")
    public ResponseEntity<?> createNurseService(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("serviceName");
        String description = (String) body.getOrDefault("description", "");
        Object priceObj = body.get("basePrice");
        java.math.BigDecimal basePrice = priceObj != null ? new java.math.BigDecimal(priceObj.toString()) : java.math.BigDecimal.ZERO;

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Service name is required"));
        }

        NurseService service = new NurseService();
        service.setServiceName(name.trim());
        service.setDescription(description);
        service.setBasePrice(basePrice);
        return ResponseEntity.ok(nurseServiceRepository.save(service));
    }

    @PutMapping("/nurse-services/{id}")
    public ResponseEntity<?> updateNurseService(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        NurseService service = nurseServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        if (body.containsKey("serviceName")) service.setServiceName(((String) body.get("serviceName")).trim());
        if (body.containsKey("description")) service.setDescription((String) body.get("description"));
        if (body.containsKey("basePrice")) service.setBasePrice(new java.math.BigDecimal(body.get("basePrice").toString()));

        return ResponseEntity.ok(nurseServiceRepository.save(service));
    }

    @DeleteMapping("/nurse-services/{id}")
    public ResponseEntity<?> deleteNurseService(@PathVariable Long id) {
        nurseServiceRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Service deleted"));
    }
}
