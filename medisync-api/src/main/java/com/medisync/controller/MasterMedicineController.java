package com.medisync.controller;

import com.medisync.entity.MasterMedicine;
import com.medisync.entity.MedicineCategory;
import com.medisync.repository.MasterMedicineRepository;
import com.medisync.repository.MedicineCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class MasterMedicineController {

    private final MasterMedicineRepository masterMedicineRepository;
    private final MedicineCategoryRepository categoryRepository;

    // ─── Admin Endpoints (CRUD) ─────────────────────────────────────────────────

    @GetMapping("/api/admin/master-medicines")
    public ResponseEntity<List<MasterMedicine>> getAll() {
        return ResponseEntity.ok(masterMedicineRepository.findAll());
    }

    @PostMapping("/api/admin/master-medicines")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("medicineName");
        Long categoryId = Long.valueOf(body.get("categoryId").toString());

        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Medicine name is required"));
        }
        if (masterMedicineRepository.existsByMedicineNameIgnoreCase(name)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Medicine name already exists"));
        }

        MedicineCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        MasterMedicine medicine = new MasterMedicine();
        medicine.setMedicineName(name.trim());
        medicine.setCategory(category);

        return ResponseEntity.ok(masterMedicineRepository.save(medicine));
    }

    @PutMapping("/api/admin/master-medicines/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        MasterMedicine medicine = masterMedicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Master medicine not found"));

        String name = (String) body.get("medicineName");
        Long categoryId = Long.valueOf(body.get("categoryId").toString());

        if (name != null && !name.isBlank() && !name.equalsIgnoreCase(medicine.getMedicineName())) {
            if (masterMedicineRepository.existsByMedicineNameIgnoreCase(name)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Medicine name already exists"));
            }
            medicine.setMedicineName(name.trim());
        }

        if (categoryId != null) {
            MedicineCategory category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            medicine.setCategory(category);
        }

        return ResponseEntity.ok(masterMedicineRepository.save(medicine));
    }

    @DeleteMapping("/api/admin/master-medicines/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        masterMedicineRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }

    // ─── Public Endpoints (for pharmacy autocomplete + user search) ─────────────

    @GetMapping("/api/master-medicines")
    public ResponseEntity<List<MasterMedicine>> getAllPublic() {
        return ResponseEntity.ok(masterMedicineRepository.findAll());
    }

    @GetMapping("/api/master-medicines/names")
    public ResponseEntity<List<String>> getAllNames() {
        return ResponseEntity.ok(masterMedicineRepository.findAllMedicineNames());
    }

    @GetMapping("/api/master-medicines/search")
    public ResponseEntity<List<MasterMedicine>> search(@RequestParam String query) {
        return ResponseEntity.ok(masterMedicineRepository.searchByName(query));
    }
}
