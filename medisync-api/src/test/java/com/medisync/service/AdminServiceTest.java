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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PharmacyRepository pharmacyRepository;
    @Mock private NurseRepository nurseRepository;
    @Mock private MedicineRepository medicineRepository;
    @Mock private AdminActivityLogRepository adminActivityLogRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void testApprovePharmacy() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("MediStore");
        pharmacy.setEmail("pharmacy@mail.com");
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
        verify(notificationService).notifyPharmacy(eq("pharmacy@mail.com"), anyString(), anyString(), anyString());
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
    void testBlockPharmacy() {
        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("MediStore");
        pharmacy.setEmail("pharmacy@mail.com");
        pharmacy.setIsBlocked(false);

        User admin = new User();
        admin.setUserId(1L);
        admin.setEmail("admin@mail.com");

        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(userRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(admin));
        when(adminActivityLogRepository.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Pharmacy result = adminService.blockPharmacy(1L, "admin@mail.com");

        assertTrue(result.getIsBlocked());
        verify(notificationService).notifyPharmacy(eq("pharmacy@mail.com"), anyString(), anyString(), anyString());
    }

    @Test
    void testBlockNurse() {
        Nurse nurse = new Nurse();
        nurse.setNurseId(1L);
        nurse.setFullName("Jane Doe");
        nurse.setEmail("nurse@mail.com");
        nurse.setIsBlocked(false);
        nurse.setAvailabilityStatus("online");

        User admin = new User();
        admin.setUserId(1L);
        admin.setEmail("admin@mail.com");

        when(nurseRepository.findById(1L)).thenReturn(Optional.of(nurse));
        when(userRepository.findByEmail("admin@mail.com")).thenReturn(Optional.of(admin));
        when(adminActivityLogRepository.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Nurse result = adminService.blockNurse(1L, "admin@mail.com");

        assertTrue(result.getIsBlocked());
        assertEquals("offline", result.getAvailabilityStatus());
        verify(notificationService).notifyNurse(eq("nurse@mail.com"), anyString(), anyString(), anyString());
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
