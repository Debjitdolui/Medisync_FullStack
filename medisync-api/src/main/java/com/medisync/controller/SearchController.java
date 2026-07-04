package com.medisync.controller;

import com.medisync.dto.PrescriptionSearchRequest;
import com.medisync.service.MedicineService;
import com.medisync.service.PrescriptionSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final PrescriptionSearchService prescriptionSearchService;
    private final MedicineService medicineService;

    @PostMapping("/prescription")
    public ResponseEntity<?> searchPrescription(@Valid @RequestBody PrescriptionSearchRequest req) {
        return ResponseEntity.ok(prescriptionSearchService.search(req));
    }

    @GetMapping("/medicines")
    public ResponseEntity<?> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(medicineService.searchByName(name));
    }
}
