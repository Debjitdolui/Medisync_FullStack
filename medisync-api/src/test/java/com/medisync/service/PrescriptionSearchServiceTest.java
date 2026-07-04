package com.medisync.service;

import com.medisync.dto.PrescriptionSearchRequest;
import com.medisync.dto.PharmacySearchResult;
import com.medisync.entity.Medicine;
import com.medisync.entity.Pharmacy;
import com.medisync.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PrescriptionSearchServiceTest {

    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private PrescriptionSearchService prescriptionSearchService;

    private Pharmacy createPharmacy(Long id, String name, double lat, double lon) {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(id);
        pharmacy.setPharmacyName(name);
        pharmacy.setLatitude(new BigDecimal(String.valueOf(lat)));
        pharmacy.setLongitude(new BigDecimal(String.valueOf(lon)));
        pharmacy.setApprovalStatus("approved");
        return pharmacy;
    }

    private Medicine createMedicine(Pharmacy pharmacy, String name, BigDecimal price, int stock) {
        Medicine medicine = new Medicine();
        medicine.setPharmacy(pharmacy);
        medicine.setMedicineName(name);
        medicine.setPrice(price);
        medicine.setStockQuantity(stock);
        return medicine;
    }

    @Test
    void testSearch_AllMedicinesFound() {
        Pharmacy pharmacy = createPharmacy(1L, "HealthPlus", 22.57, 88.36);

        Medicine med1 = createMedicine(pharmacy, "paracetamol", new BigDecimal("30.00"), 50);
        Medicine med2 = createMedicine(pharmacy, "amoxicillin", new BigDecimal("70.00"), 20);

        PrescriptionSearchRequest request = new PrescriptionSearchRequest();
        request.setMedicineNames(Arrays.asList("paracetamol", "amoxicillin"));
        request.setLatitude(new BigDecimal("22.57"));
        request.setLongitude(new BigDecimal("88.36"));

        when(medicineRepository.findByMedicineNameInAndInStock(any())).thenReturn(Arrays.asList(med1, med2));

        List<PharmacySearchResult> results = prescriptionSearchService.search(request);

        assertEquals(true, results.get(0).isHasAllMedicines());
        assertEquals(2, results.get(0).getMedicinesFound());
        assertEquals(2, results.get(0).getTotalSearched());
    }

    @Test
    void testSearch_PartialMatch() {
        Pharmacy pharmacy = createPharmacy(1L, "HealthPlus", 22.57, 88.36);

        Medicine med1 = createMedicine(pharmacy, "paracetamol", new BigDecimal("30.00"), 50);

        PrescriptionSearchRequest request = new PrescriptionSearchRequest();
        request.setMedicineNames(Arrays.asList("paracetamol", "amoxicillin"));
        request.setLatitude(new BigDecimal("22.57"));
        request.setLongitude(new BigDecimal("88.36"));

        when(medicineRepository.findByMedicineNameInAndInStock(any())).thenReturn(List.of(med1));

        List<PharmacySearchResult> results = prescriptionSearchService.search(request);

        assertEquals(false, results.get(0).isHasAllMedicines());
        assertEquals(1, results.get(0).getMedicinesFound());
        assertEquals(2, results.get(0).getTotalSearched());
    }

    @Test
    void testSearch_FilterByDistance() {
        Pharmacy farPharmacy = createPharmacy(2L, "FarPharmacy", 23.0, 89.0);

        Medicine med = createMedicine(farPharmacy, "paracetamol", new BigDecimal("30.00"), 50);

        PrescriptionSearchRequest request = new PrescriptionSearchRequest();
        request.setMedicineNames(List.of("paracetamol"));
        request.setLatitude(new BigDecimal("22.57"));
        request.setLongitude(new BigDecimal("88.36"));
        request.setMaxDistanceKm(new BigDecimal("5"));

        when(medicineRepository.findByMedicineNameInAndInStock(any())).thenReturn(List.of(med));

        List<PharmacySearchResult> results = prescriptionSearchService.search(request);

        assertTrue(results.isEmpty());
    }
}
