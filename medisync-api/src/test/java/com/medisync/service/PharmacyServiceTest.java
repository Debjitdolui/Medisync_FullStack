package com.medisync.service;

import com.medisync.dto.PharmacyRegisterRequest;
import com.medisync.entity.Pharmacy;
import com.medisync.repository.PharmacyRepository;
import com.medisync.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacyServiceTest {

    @Mock private PharmacyRepository pharmacyRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks private PharmacyService pharmacyService;

    @Test
    void testRegister_Success() {
        PharmacyRegisterRequest request = new PharmacyRegisterRequest();
        request.setEmail("pharmacy@example.com");
        request.setLicenseNumber("LIC123");
        request.setPassword("password123");
        request.setOwnerName("John");
        request.setPharmacyName("HealthPlus");

        Pharmacy savedPharmacy = new Pharmacy();
        savedPharmacy.setPharmacyId(1L);
        savedPharmacy.setEmail("pharmacy@example.com");
        savedPharmacy.setApprovalStatus("pending");

        when(pharmacyRepository.existsByEmail("pharmacy@example.com")).thenReturn(false);
        when(pharmacyRepository.existsByLicenseNumber("LIC123")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed");
        when(pharmacyRepository.save(any(Pharmacy.class))).thenReturn(savedPharmacy);

        Pharmacy result = pharmacyService.register(request);

        assertEquals("pending", result.getApprovalStatus());
        verify(pharmacyRepository).save(any(Pharmacy.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        PharmacyRegisterRequest request = new PharmacyRegisterRequest();
        request.setEmail("pharmacy@example.com");

        when(pharmacyRepository.existsByEmail("pharmacy@example.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> pharmacyService.register(request));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    void testGetById_Found() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("HealthPlus");

        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));

        Pharmacy result = pharmacyService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getPharmacyId());
    }

    @Test
    void testGetById_NotFound() {
        when(pharmacyRepository.findById(1L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> pharmacyService.getById(1L));
        assertEquals("Pharmacy not found", ex.getMessage());
    }
}
