package com.medisync.service;

import com.medisync.dto.request.MedicineRequest;
import com.medisync.dto.request.StockUpdateRequest;
import com.medisync.model.InventoryLog;
import com.medisync.model.Medicine;
import com.medisync.model.MedicineCategory;
import com.medisync.model.Pharmacy;
import com.medisync.repository.InventoryLogRepository;
import com.medisync.repository.MedicineCategoryRepository;
import com.medisync.repository.MedicineRepository;
import com.medisync.repository.PharmacyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MedicineServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @Mock
    private MedicineCategoryRepository categoryRepository;

    @Mock
    private PharmacyRepository pharmacyRepository;

    @Mock
    private InventoryLogRepository inventoryLogRepository;

    @InjectMocks
    private MedicineService medicineService;

    @Test
    void testAddMedicine_Success() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("HealthPlus");

        MedicineCategory category = new MedicineCategory();
        category.setCategoryId(1L);

        MedicineRequest request = new MedicineRequest();
        request.setPharmacyId(1L);
        request.setCategoryId(1L);
        request.setMedicineName("Paracetamol");
        request.setManufacturer("PharmaCorp");
        request.setPrice(new BigDecimal("50.00"));
        request.setStockQuantity(100);
        request.setExpiryDate(LocalDate.of(2027, 6, 1));
        request.setDescription("Pain reliever");

        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setPharmacy(pharmacy);
        medicine.setCategory(category);
        medicine.setMedicineName("Paracetamol");
        medicine.setStockQuantity(100);

        InventoryLog log = new InventoryLog();
        log.setLogId(1L);

        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        when(inventoryLogRepository.save(any(InventoryLog.class))).thenReturn(log);

        Medicine result = medicineService.addMedicine(request);

        assertEquals("Paracetamol", result.getMedicineName());
        verify(medicineRepository).save(any(Medicine.class));
        verify(inventoryLogRepository).save(any(InventoryLog.class));
    }

    @Test
    void testUpdateStock_Add() {
        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setStockQuantity(100);

        StockUpdateRequest request = new StockUpdateRequest();
        request.setQuantity(50);
        request.setAction("add");

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        when(inventoryLogRepository.save(any(InventoryLog.class))).thenReturn(new InventoryLog());

        Medicine result = medicineService.updateStock(1L, request);

        assertEquals(150, result.getStockQuantity());
        verify(inventoryLogRepository).save(any(InventoryLog.class));
    }

    @Test
    void testUpdateStock_Remove() {
        Medicine medicine = new Medicine();
        medicine.setMedicineId(1L);
        medicine.setStockQuantity(100);

        StockUpdateRequest request = new StockUpdateRequest();
        request.setQuantity(30);
        request.setAction("remove");

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(medicine);
        when(inventoryLogRepository.save(any(InventoryLog.class))).thenReturn(new InventoryLog());

        Medicine result = medicineService.updateStock(1L, request);

        assertEquals(70, result.getStockQuantity());
    }

    @Test
    void testDeleteMedicine() {
        medicineService.deleteMedicine(1L);

        verify(medicineRepository).deleteById(1L);
    }
}
