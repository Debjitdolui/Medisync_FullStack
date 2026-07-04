package com.medisync.controller;

import com.medisync.dto.NurseRequestDto;
import com.medisync.service.NurseModuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nurse-requests")
@RequiredArgsConstructor
public class NurseRequestController {

    private final NurseModuleService nurseModuleService;

    @PostMapping
    public ResponseEntity<?> createRequest(Authentication auth, @RequestBody NurseRequestDto dto) {
        return ResponseEntity.ok(nurseModuleService.createRequest(auth.getName(), dto));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getPatientRequests(Authentication auth) {
        return ResponseEntity.ok(nurseModuleService.getPatientRequests(auth.getName()));
    }

    @GetMapping("/nurse")
    public ResponseEntity<?> getNurseRequests(Authentication auth) {
        return ResponseEntity.ok(nurseModuleService.getNurseRequests(auth.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(nurseModuleService.updateRequestStatus(id, status));
    }
}
