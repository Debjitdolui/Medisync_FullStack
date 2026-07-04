package com.medisync.controller;

import com.medisync.dto.MedicineRequest;
import com.medisync.dto.StockUpdateRequest;
import com.medisync.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @PostMapping
    public ResponseEntity<?> addMedicine(@Valid @RequestBody MedicineRequest req) {
        return ResponseEntity.ok(medicineService.addMedicine(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedicine(@PathVariable Long id, @Valid @RequestBody MedicineRequest req) {
        return ResponseEntity.ok(medicineService.updateMedicine(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<?> getByPharmacy(@RequestParam Long pharmacyId, Pageable pageable) {
        return ResponseEntity.ok(medicineService.getByPharmacy(pharmacyId, pageable));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @Valid @RequestBody StockUpdateRequest req) {
        return ResponseEntity.ok(medicineService.updateStock(id, req));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(medicineService.getCategories());
    }
}
