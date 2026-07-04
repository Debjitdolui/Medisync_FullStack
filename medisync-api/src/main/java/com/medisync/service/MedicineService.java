package com.medisync.service;

import com.medisync.dto.MedicineRequest;
import com.medisync.dto.StockUpdateRequest;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final PharmacyRepository pharmacyRepository;
    private final InventoryLogRepository inventoryLogRepository;

    public Medicine addMedicine(MedicineRequest req) {
        Medicine m = new Medicine();
        m.setPharmacy(pharmacyRepository.findById(req.getPharmacyId()).orElseThrow());
        m.setCategory(categoryRepository.findById(req.getCategoryId()).orElseThrow());
        m.setMedicineName(req.getMedicineName());
        m.setManufacturer(req.getManufacturer());
        m.setPrice(req.getPrice());
        m.setStockQuantity(req.getStockQuantity());
        m.setExpiryDate(req.getExpiryDate());
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
        m.setCategory(categoryRepository.findById(req.getCategoryId()).orElseThrow());
        m.setMedicineName(req.getMedicineName());
        m.setManufacturer(req.getManufacturer());
        m.setPrice(req.getPrice());
        m.setStockQuantity(req.getStockQuantity());
        m.setExpiryDate(req.getExpiryDate());
        m.setDescription(req.getDescription());
        return medicineRepository.save(m);
    }

    public void deleteMedicine(Long id) {
        medicineRepository.deleteById(id);
    }

    public List<Medicine> getByPharmacy(Long pharmacyId) {
        return medicineRepository.findByPharmacyPharmacyId(pharmacyId);
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
}
