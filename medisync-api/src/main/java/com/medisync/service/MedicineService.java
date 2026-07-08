package com.medisync.service;

import com.medisync.dto.MedicineRequest;
import com.medisync.dto.StockUpdateRequest;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final InventoryLogRepository inventoryLogRepository;
    private final MasterMedicineRepository masterMedicineRepository;

    public Medicine addMedicine(MedicineRequest req) {
        MasterMedicine master = masterMedicineRepository.findById(req.getMasterMedicineId())
                .orElseThrow(() -> new RuntimeException("Master medicine not found"));

        Medicine m = new Medicine();
        m.setPharmacy(pharmacyRepository.findById(req.getPharmacyId()).orElseThrow());
        m.setMasterMedicine(master);
        m.setCategory(master.getCategory());
        m.setMedicineName(master.getMedicineName());
        m.setBrand(req.getBrand());
        m.setPrice(req.getPrice());
        m.setStockQuantity(req.getStockQuantity());
        m.setDescription(req.getDescription());
        Medicine saved = medicineRepository.save(m);

        InventoryLog log = new InventoryLog();
        log.setMedicine(saved);
        log.setAction("add");
        log.setQuantityChange(saved.getStockQuantity());
        log.setStockAfter(saved.getStockQuantity());
        inventoryLogRepository.save(log);
        return saved;
    }

    public Medicine updateMedicine(Long id, MedicineRequest req) {
        Medicine m = medicineRepository.findById(id).orElseThrow();

        MasterMedicine master = masterMedicineRepository.findById(req.getMasterMedicineId())
                .orElseThrow(() -> new RuntimeException("Master medicine not found"));

        m.setMasterMedicine(master);
        m.setCategory(master.getCategory());
        m.setMedicineName(master.getMedicineName());
        m.setBrand(req.getBrand());
        m.setPrice(req.getPrice());
        m.setStockQuantity(req.getStockQuantity());
        m.setDescription(req.getDescription());
        return medicineRepository.save(m);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        inventoryLogRepository.deleteByMedicineMedicineId(id);
        medicineRepository.deleteById(id);
    }

    public List<Medicine> getByPharmacy(Long pharmacyId) {
        return medicineRepository.findByPharmacyPharmacyId(pharmacyId);
    }

    public Page<Medicine> getByPharmacy(Long pharmacyId, Pageable pageable) {
        return medicineRepository.findByPharmacyPharmacyId(pharmacyId, pageable);
    }

    public Medicine updateStock(Long id, StockUpdateRequest req) {
        Medicine m = medicineRepository.findById(id).orElseThrow();
        int change = req.getAction().equals("add") ? req.getQuantity() : -req.getQuantity();
        m.setStockQuantity(m.getStockQuantity() + change);
        Medicine saved = medicineRepository.save(m);

        InventoryLog log = new InventoryLog();
        log.setMedicine(saved);
        log.setAction(req.getAction());
        log.setQuantityChange(req.getQuantity());
        log.setStockAfter(saved.getStockQuantity());
        inventoryLogRepository.save(log);
        return saved;
    }

    public List<MedicineCategory> getCategories() {
        return categoryRepository.findAll();
    }

    public List<Medicine> searchByName(String name) {
        return medicineRepository.searchByName(name);
    }

    public Page<Medicine> searchByName(String name, Pageable pageable) {
        return medicineRepository.searchByName(name, pageable);
    }

    public List<String> getAllMedicineNames() {
        return masterMedicineRepository.findAllMedicineNames();
    }
}
