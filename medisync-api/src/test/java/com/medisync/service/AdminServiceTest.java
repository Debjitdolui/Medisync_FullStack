package com.medisync.service;

import com.medisync.entity.*;
import com.medisync.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PharmacyRepository pharmacyRepository;
    @Mock
    private NurseRepository nurseRepository;
    @Mock
    private MedicineRepository medicineRepository;
    @Mock
    private AdminActivityLogRepository adminActivityLogRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    void testApprovePharmacy() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("MediStore");
        pharmacy.setApprovalStatus("pending");

        User adminUser = new User();
        adminUser.setUserId(1L);
        adminUser.setEmail("admin@mail.com");

        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(userRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(adminUser));
        when(adminActivityLogRepository.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Pharmacy result = adminService.approvePharmacy(1L, "approved", "admin@mail.com");

        assertEquals("approved", result.getApprovalStatus());
        verify(pharmacyRepository).save(pharmacy);
    }

    @Test
    void testBlockUser() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("user@mail.com");
        user.setStatus("active");
        user.setIsActive(true);

        User admin = new User();
        admin.setUserId(2L);
        admin.setEmail("admin@mail.com");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(admin));
        when(adminActivityLogRepository.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        User result = adminService.blockUser(1L, "admin@mail.com");

        assertEquals("blocked", result.getStatus());
        assertFalse(result.getIsActive());
        verify(userRepository).save(user);
    }

    @Test
    void testGetDashboard() {
        when(userRepository.count()).thenReturn(10L);
        when(pharmacyRepository.count()).thenReturn(5L);
        when(nurseRepository.count()).thenReturn(3L);
        when(medicineRepository.count()).thenReturn(50L);
        when(pharmacyRepository.findByApprovalStatus("approved")).thenReturn(Arrays.asList(new Pharmacy(), new Pharmacy(), new Pharmacy()));
        when(pharmacyRepository.findByApprovalStatus("pending")).thenReturn(Arrays.asList(new Pharmacy(), new Pharmacy()));

        Map<String, Object> dashboard = adminService.getDashboard();

        assertEquals(10L, dashboard.get("totalUsers"));
        assertEquals(5L, dashboard.get("totalPharmacies"));
        assertEquals(3L, dashboard.get("totalNurses"));
        assertEquals(50L, dashboard.get("totalMedicines"));
        assertEquals(3, dashboard.get("approvedPharmacies"));
        assertEquals(2, dashboard.get("pendingPharmacies"));
    }
}
