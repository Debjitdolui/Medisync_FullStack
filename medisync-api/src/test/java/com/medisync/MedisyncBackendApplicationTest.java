package com.medisync;

import com.medisync.dto.*;
import com.medisync.entity.*;
import com.medisync.repository.*;
import com.medisync.service.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedisyncBackendApplicationTest {

    @Mock private UserRepository userRepo;
    @Mock private UserAddressRepository addressRepo;
    @Mock private PharmacyRepository pharmacyRepo;
    @Mock private NurseRepository nurseRepo;
    @Mock private PasswordResetRepository resetRepo;
    @Mock private MedicineRepository medicineRepo;
    @Mock private MedicineCategoryRepository categoryRepo;
    @Mock private InventoryLogRepository inventoryLogRepo;
    @Mock private NurseServiceRepository nurseServiceRepo;
    @Mock private NurseRequestRepository nurseRequestRepo;
    @Mock private PharmacyReviewRepository pharmacyReviewRepo;
    @Mock private NurseReviewRepository nurseReviewRepo;
    @Mock private AdminActivityLogRepository adminActivityLogRepo;
    @Mock private NotificationRepository notificationRepo;
    @Mock private PasswordEncoder encoder;

    @InjectMocks private AuthService authService;
    @InjectMocks private UserService userService;
    @InjectMocks private PharmacyService pharmacyService;
    @InjectMocks private MedicineService medicineService;
    @InjectMocks private PrescriptionSearchService prescriptionSearchService;
    @InjectMocks private NurseModuleService nurseModuleService;
    @InjectMocks private AdminService adminService;
    @InjectMocks private ReviewService reviewService;
    @InjectMocks private NotificationService notificationService;

    // ==================== AUTH TESTS (8) ====================

    @Test
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@mail.com");
        req.setUsername("testuser");
        req.setPassword("Pass@123");

        when(userRepo.existsByEmail("test@mail.com")).thenReturn(false);
        when(userRepo.existsByUsername("testuser")).thenReturn(false);
        when(encoder.encode("Pass@123")).thenReturn("hashed");
        when(userRepo.save(any(User.class))).thenReturn(createUser());

        AuthResponse response = authService.register(req);
        assertEquals("registered", response.getToken());
        assertEquals("customer", response.getRole());
        verify(userRepo).save(any(User.class));
    }

    @Test
    void testRegister_EmailExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@mail.com");
        when(userRepo.existsByEmail("test@mail.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(req));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    void testRegister_UsernameExists() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@mail.com");
        req.setUsername("testuser");
        when(userRepo.existsByEmail("test@mail.com")).thenReturn(false);
        when(userRepo.existsByUsername("testuser")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.register(req));
        assertEquals("Username already taken", ex.getMessage());
    }

    @Test
    void testLogin_SuccessAsCustomer() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@mail.com");
        req.setPassword("Pass@123");

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(encoder.matches("Pass@123", "hashed")).thenReturn(true);

        AuthResponse response = authService.login(req);
        assertEquals("login-success", response.getToken());
        assertEquals("customer", response.getRole());
    }

    @Test
    void testLogin_SuccessAsPharmacy() {
        LoginRequest req = new LoginRequest();
        req.setEmail("pharm@mail.com");
        req.setPassword("Pass@123");

        Pharmacy pharmacy = createPharmacy();
        when(userRepo.findByEmail("pharm@mail.com")).thenReturn(Optional.empty());
        when(pharmacyRepo.findByEmail("pharm@mail.com")).thenReturn(Optional.of(pharmacy));
        when(encoder.matches("Pass@123", pharmacy.getPasswordHash())).thenReturn(true);

        AuthResponse response = authService.login(req);
        assertEquals("login-success", response.getToken());
        assertEquals("pharmacy", response.getRole());
    }

    @Test
    void testLogin_SuccessAsNurse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("priya@mail.com");
        req.setPassword("Pass@123");

        Nurse nurse = createNurse();
        when(userRepo.findByEmail("priya@mail.com")).thenReturn(Optional.empty());
        when(pharmacyRepo.findByEmail("priya@mail.com")).thenReturn(Optional.empty());
        when(nurseRepo.findByEmail("priya@mail.com")).thenReturn(Optional.of(nurse));
        when(encoder.matches("Pass@123", "hashed")).thenReturn(true);

        AuthResponse response = authService.login(req);
        assertEquals("login-success", response.getToken());
        assertEquals("nurse", response.getRole());
    }

    @Test
    void testLogin_InvalidPassword() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@mail.com");
        req.setPassword("wrong");

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(encoder.matches("wrong", "hashed")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void testLogin_EmailNotFound() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@mail.com");
        req.setPassword("Pass@123");

        when(userRepo.findByEmail("nobody@mail.com")).thenReturn(Optional.empty());
        when(pharmacyRepo.findByEmail("nobody@mail.com")).thenReturn(Optional.empty());
        when(nurseRepo.findByEmail("nobody@mail.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("Invalid credentials", ex.getMessage());
    }

    @Test
    void testLogin_DeactivatedAccount() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@mail.com");
        req.setPassword("Pass@123");

        User user = createUser();
        user.setIsActive(false);
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(encoder.matches("Pass@123", "hashed")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(req));
        assertEquals("Account is deactivated", ex.getMessage());
    }

    @Test
    void testForgotPassword_Success() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("test@mail.com");

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(resetRepo.save(any(PasswordReset.class))).thenReturn(new PasswordReset());

        String result = authService.forgotPassword(req);
        assertTrue(result.contains("OTP sent to"));
        verify(resetRepo).save(any(PasswordReset.class));
    }

    @Test
    void testForgotPassword_EmailNotFound() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("unknown@mail.com");
        when(userRepo.findByEmail("unknown@mail.com")).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.forgotPassword(req));
        assertEquals("Email not found", ex.getMessage());
    }

    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail("test@mail.com");
        req.setOtp("123456");
        req.setNewPassword("NewPass@123");

        User user = createUser();
        PasswordReset reset = new PasswordReset();
        reset.setOtpCode("123456");
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        reset.setIsUsed(false);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(resetRepo.findTopByUserUserIdAndIsUsedFalseOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(reset));
        when(encoder.encode("NewPass@123")).thenReturn("newHashed");
        when(resetRepo.save(any(PasswordReset.class))).thenReturn(reset);
        when(userRepo.save(any(User.class))).thenReturn(user);

        String result = authService.resetPassword(req);
        assertEquals("Password reset successful", result);
    }

    @Test
    void testResetPassword_InvalidOtp() {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail("test@mail.com");
        req.setOtp("000000");
        req.setNewPassword("NewPass@123");

        PasswordReset reset = new PasswordReset();
        reset.setOtpCode("123456");
        reset.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        reset.setIsUsed(false);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(resetRepo.findTopByUserUserIdAndIsUsedFalseOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(reset));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.resetPassword(req));
        assertEquals("Invalid OTP", ex.getMessage());
    }

    @Test
    void testResetPassword_ExpiredOtp() {
        ResetPasswordRequest req = new ResetPasswordRequest();
        req.setEmail("test@mail.com");
        req.setOtp("123456");
        req.setNewPassword("NewPass@123");

        PasswordReset reset = new PasswordReset();
        reset.setOtpCode("123456");
        reset.setExpiresAt(LocalDateTime.now().minusMinutes(5));
        reset.setIsUsed(false);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(resetRepo.findTopByUserUserIdAndIsUsedFalseOrderByCreatedAtDesc(1L)).thenReturn(Optional.of(reset));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.resetPassword(req));
        assertEquals("OTP expired", ex.getMessage());
    }


    // ==================== USER SERVICE TESTS (7) ====================

    @Test
    void testGetProfile_Success() {
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        User result = userService.getProfile("test@mail.com");
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void testGetProfile_NotFound() {
        when(userRepo.findByEmail("x@mail.com")).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> userService.getProfile("x@mail.com"));
        assertEquals("User not found", ex.getMessage());
    }

    @Test
    void testUpdateProfile_Success() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setUsername("newname");
        req.setPhone("9999999999");

        User user = createUser();
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(userRepo.existsByUsername("newname")).thenReturn(false);
        when(userRepo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User result = userService.updateProfile("test@mail.com", req);
        assertEquals("newname", result.getUsername());
        assertEquals("9999999999", result.getPhone());
    }

    @Test
    void testUpdateProfile_UsernameTaken() {
        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setUsername("taken");

        User user = createUser();
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(userRepo.existsByUsername("taken")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.updateProfile("test@mail.com", req));
        assertEquals("Username already taken", ex.getMessage());
    }

    @Test
    void testDeactivateAccount() {
        User user = createUser();
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        userService.deactivate("test@mail.com");

        assertFalse(user.getIsActive());
        assertEquals("inactive", user.getStatus());
        verify(userRepo).save(user);
    }

    @Test
    void testReactivateAccount_Success() {
        User user = createUser();
        user.setIsActive(false);
        user.setStatus("inactive");

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(encoder.matches("Pass@123", "hashed")).thenReturn(true);
        when(userRepo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        userService.reactivate("test@mail.com", "Pass@123");

        assertTrue(user.getIsActive());
        assertEquals("active", user.getStatus());
    }

    @Test
    void testReactivateAccount_WrongPassword() {
        User user = createUser();
        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(encoder.matches("wrong", "hashed")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.reactivate("test@mail.com", "wrong"));
        assertEquals("Invalid password", ex.getMessage());
    }

    @Test
    void testAddAddress_Success() {
        AddressRequest req = new AddressRequest();
        req.setAddressLine("123 Main St");
        req.setCity("Kolkata");
        req.setState("West Bengal");
        req.setPincode("700001");
        req.setIsDefault(true);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(createUser()));
        when(addressRepo.save(any(UserAddress.class))).thenAnswer(i -> i.getArgument(0));

        UserAddress result = userService.addAddress("test@mail.com", req);
        assertEquals("123 Main St", result.getAddressLine());
        assertEquals("Kolkata", result.getCity());
    }

    @Test
    void testDeleteAddress_Success() {
        User user = createUser();
        UserAddress addr = new UserAddress();
        addr.setAddressId(1L);
        addr.setUser(user);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(addressRepo.findById(1L)).thenReturn(Optional.of(addr));

        userService.deleteAddress("test@mail.com", 1L);
        verify(addressRepo).delete(addr);
    }

    @Test
    void testDeleteAddress_AccessDenied() {
        User user = createUser();
        User otherUser = new User();
        otherUser.setUserId(99L);

        UserAddress addr = new UserAddress();
        addr.setAddressId(1L);
        addr.setUser(otherUser);

        when(userRepo.findByEmail("test@mail.com")).thenReturn(Optional.of(user));
        when(addressRepo.findById(1L)).thenReturn(Optional.of(addr));

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> userService.deleteAddress("test@mail.com", 1L));
        assertEquals("Access denied", ex.getMessage());
    }


    // ==================== PHARMACY TESTS (5) ====================

    @Test
    void testPharmacyRegister_Success() {
        PharmacyRegisterRequest req = createPharmacyRequest();
        when(pharmacyRepo.existsByEmail("pharm@mail.com")).thenReturn(false);
        when(pharmacyRepo.existsByLicenseNumber("LIC-001")).thenReturn(false);
        when(encoder.encode("Pass@123")).thenReturn("hashed");
        when(pharmacyRepo.save(any(Pharmacy.class))).thenReturn(createPharmacy());

        Pharmacy result = pharmacyService.register(req);
        assertEquals("pending", result.getApprovalStatus());
        verify(pharmacyRepo).save(any(Pharmacy.class));
    }

    @Test
    void testPharmacyRegister_DuplicateEmail() {
        PharmacyRegisterRequest req = createPharmacyRequest();
        when(pharmacyRepo.existsByEmail("pharm@mail.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> pharmacyService.register(req));
        assertEquals("Email already registered", ex.getMessage());
    }

    @Test
    void testPharmacyRegister_DuplicateLicense() {
        PharmacyRegisterRequest req = createPharmacyRequest();
        when(pharmacyRepo.existsByEmail("pharm@mail.com")).thenReturn(false);
        when(pharmacyRepo.existsByLicenseNumber("LIC-001")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> pharmacyService.register(req));
        assertEquals("License number already registered", ex.getMessage());
    }

    @Test
    void testPharmacyGetById_Found() {
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(createPharmacy()));
        Pharmacy result = pharmacyService.getById(1L);
        assertNotNull(result);
        assertEquals("HealthPlus", result.getPharmacyName());
    }

    @Test
    void testPharmacyGetById_NotFound() {
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.empty());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> pharmacyService.getById(1L));
        assertEquals("Pharmacy not found", ex.getMessage());
    }

    @Test
    void testPharmacyListApproved() {
        List<Pharmacy> list = List.of(createPharmacy(), createPharmacy());
        when(pharmacyRepo.findByApprovalStatus("approved")).thenReturn(list);

        List<Pharmacy> result = pharmacyService.listApproved();
        assertEquals(2, result.size());
    }

    // ==================== MEDICINE TESTS (5) ====================

    @Test
    void testAddMedicine_Success() {
        MedicineRequest req = new MedicineRequest();
        req.setPharmacyId(1L);
        req.setCategoryId(1L);
        req.setMedicineName("Paracetamol");
        req.setPrice(BigDecimal.valueOf(25));
        req.setStockQuantity(100);
        req.setExpiryDate(LocalDate.of(2027, 12, 31));

        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(createPharmacy()));
        when(categoryRepo.findById(1L)).thenReturn(Optional.of(createCategory()));
        when(medicineRepo.save(any(Medicine.class))).thenReturn(createMedicine("Paracetamol", 25, 100));
        when(inventoryLogRepo.save(any(InventoryLog.class))).thenReturn(new InventoryLog());

        Medicine result = medicineService.addMedicine(req);
        assertNotNull(result);
        assertEquals("Paracetamol", result.getMedicineName());
        verify(inventoryLogRepo).save(any(InventoryLog.class));
    }

    @Test
    void testUpdateStock_Add() {
        Medicine medicine = createMedicine("Paracetamol", 25, 100);
        StockUpdateRequest req = new StockUpdateRequest();
        req.setQuantity(50);
        req.setAction("add");

        when(medicineRepo.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepo.save(any(Medicine.class))).thenAnswer(i -> i.getArgument(0));
        when(inventoryLogRepo.save(any(InventoryLog.class))).thenReturn(new InventoryLog());

        Medicine result = medicineService.updateStock(1L, req);
        assertEquals(150, result.getStockQuantity());
    }

    @Test
    void testUpdateStock_Remove() {
        Medicine medicine = createMedicine("Paracetamol", 25, 100);
        StockUpdateRequest req = new StockUpdateRequest();
        req.setQuantity(30);
        req.setAction("remove");

        when(medicineRepo.findById(1L)).thenReturn(Optional.of(medicine));
        when(medicineRepo.save(any(Medicine.class))).thenAnswer(i -> i.getArgument(0));
        when(inventoryLogRepo.save(any(InventoryLog.class))).thenReturn(new InventoryLog());

        Medicine result = medicineService.updateStock(1L, req);
        assertEquals(70, result.getStockQuantity());
    }

    @Test
    void testDeleteMedicine() {
        medicineService.deleteMedicine(1L);
        verify(medicineRepo).deleteById(1L);
    }

    @Test
    void testGetCategories() {
        List<MedicineCategory> cats = List.of(createCategory());
        when(categoryRepo.findAll()).thenReturn(cats);

        List<MedicineCategory> result = medicineService.getCategories();
        assertEquals(1, result.size());
        assertEquals("Tablets", result.get(0).getCategoryName());
    }

    @Test
    void testSearchMedicineByName() {
        List<Medicine> meds = List.of(createMedicine("Paracetamol 500mg", 25, 50));
        when(medicineRepo.searchByName("para")).thenReturn(meds);

        List<Medicine> result = medicineService.searchByName("para");
        assertEquals(1, result.size());
    }


    // ==================== PRESCRIPTION SEARCH TESTS (3) ====================

    @Test
    void testSearch_AllMedicinesFound() {
        Pharmacy pharmacy = createPharmacy();
        List<Medicine> medicines = List.of(
                createMedicineWithPharmacy("paracetamol 500mg", 25, pharmacy),
                createMedicineWithPharmacy("amoxicillin 250mg", 45, pharmacy));

        when(medicineRepo.findByMedicineNameInAndInStock(any())).thenReturn(medicines);

        PrescriptionSearchRequest req = new PrescriptionSearchRequest();
        req.setMedicineNames(List.of("Paracetamol 500mg", "Amoxicillin 250mg"));
        req.setLatitude(BigDecimal.valueOf(22.57));
        req.setLongitude(BigDecimal.valueOf(88.36));

        List<PharmacySearchResult> results = prescriptionSearchService.search(req);
        assertEquals(1, results.size());
        assertTrue(results.get(0).isHasAllMedicines());
        assertEquals(2, results.get(0).getMedicinesFound());
    }

    @Test
    void testSearch_PartialMatch() {
        Pharmacy pharmacy = createPharmacy();
        List<Medicine> medicines = List.of(
                createMedicineWithPharmacy("paracetamol 500mg", 25, pharmacy));

        when(medicineRepo.findByMedicineNameInAndInStock(any())).thenReturn(medicines);

        PrescriptionSearchRequest req = new PrescriptionSearchRequest();
        req.setMedicineNames(List.of("Paracetamol 500mg", "Amoxicillin 250mg"));

        List<PharmacySearchResult> results = prescriptionSearchService.search(req);
        assertEquals(1, results.size());
        assertFalse(results.get(0).isHasAllMedicines());
        assertEquals(1, results.get(0).getMedicinesFound());
        assertEquals(2, results.get(0).getTotalSearched());
    }

    @Test
    void testSearch_FilterByDistance() {
        Pharmacy farPharmacy = new Pharmacy();
        farPharmacy.setPharmacyId(1L);
        farPharmacy.setPharmacyName("FarPharm");
        farPharmacy.setLatitude(BigDecimal.valueOf(25.0));
        farPharmacy.setLongitude(BigDecimal.valueOf(90.0));

        when(medicineRepo.findByMedicineNameInAndInStock(any()))
                .thenReturn(List.of(createMedicineWithPharmacy("paracetamol 500mg", 25, farPharmacy)));

        PrescriptionSearchRequest req = new PrescriptionSearchRequest();
        req.setMedicineNames(List.of("Paracetamol 500mg"));
        req.setLatitude(BigDecimal.valueOf(22.57));
        req.setLongitude(BigDecimal.valueOf(88.36));
        req.setMaxDistanceKm(BigDecimal.valueOf(5));

        List<PharmacySearchResult> results = prescriptionSearchService.search(req);
        assertTrue(results.isEmpty());
    }

    // ==================== NURSE TESTS (6) ====================

    @Test
    void testNurseRegister_Success() {
        NurseRegisterRequest req = new NurseRegisterRequest();
        req.setFullName("Priya Sharma");
        req.setEmail("priya@mail.com");
        req.setPassword("Nurse@123");
        req.setPhone("9123456780");
        req.setQualification("B.Sc Nursing");
        req.setLicenseNumber("NUR-001");
        req.setSpecialization("Home Care");

        when(nurseRepo.existsByEmail("priya@mail.com")).thenReturn(false);
        when(nurseRepo.existsByLicenseNumber("NUR-001")).thenReturn(false);
        when(encoder.encode("Nurse@123")).thenReturn("hashed");
        when(nurseRepo.save(any(Nurse.class))).thenReturn(createNurse());

        Nurse result = nurseModuleService.register(req);
        assertNotNull(result);
        assertEquals("Priya Sharma", result.getFullName());
    }

    @Test
    void testNurseRegister_DuplicateEmail() {
        NurseRegisterRequest req = new NurseRegisterRequest();
        req.setEmail("priya@mail.com");
        when(nurseRepo.existsByEmail("priya@mail.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> nurseModuleService.register(req));
        assertEquals("Email already exists", ex.getMessage());
    }

    @Test
    void testNurseRegister_DuplicateLicense() {
        NurseRegisterRequest req = new NurseRegisterRequest();
        req.setEmail("new@mail.com");
        req.setLicenseNumber("NUR-001");
        when(nurseRepo.existsByEmail("new@mail.com")).thenReturn(false);
        when(nurseRepo.existsByLicenseNumber("NUR-001")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> nurseModuleService.register(req));
        assertEquals("License number already exists", ex.getMessage());
    }

    @Test
    void testUpdateNurseAvailability() {
        Nurse nurse = createNurse();
        when(nurseRepo.findByEmail("priya@mail.com")).thenReturn(Optional.of(nurse));
        when(nurseRepo.save(any(Nurse.class))).thenAnswer(i -> i.getArgument(0));

        Nurse result = nurseModuleService.updateAvailability("priya@mail.com", "offline");
        assertEquals("offline", result.getAvailabilityStatus());
    }

    @Test
    void testCreateNurseRequest_Success() {
        NurseRequestDto dto = new NurseRequestDto();
        dto.setNurseId(1L);
        dto.setServiceId(1L);
        dto.setAddress("123 Main St");
        dto.setRequestDate(LocalDate.now());

        when(userRepo.findByEmail("patient@mail.com")).thenReturn(Optional.of(createUser()));
        when(nurseRepo.findById(1L)).thenReturn(Optional.of(createNurse()));
        when(nurseServiceRepo.findById(1L)).thenReturn(Optional.of(createNurseService()));
        when(nurseRequestRepo.save(any(NurseRequest.class))).thenReturn(new NurseRequest());

        NurseRequest result = nurseModuleService.createRequest("patient@mail.com", dto);
        assertNotNull(result);
        verify(nurseRequestRepo).save(any(NurseRequest.class));
    }

    @Test
    void testUpdateNurseRequestStatus() {
        NurseRequest request = new NurseRequest();
        request.setRequestId(1L);
        request.setRequestStatus("pending");

        when(nurseRequestRepo.findById(1L)).thenReturn(Optional.of(request));
        when(nurseRequestRepo.save(any(NurseRequest.class))).thenAnswer(i -> i.getArgument(0));

        NurseRequest result = nurseModuleService.updateRequestStatus(1L, "accepted");
        assertEquals("accepted", result.getRequestStatus());
    }

    // ==================== ADMIN TESTS (5) ====================

    @Test
    void testApprovePharmacy() {
        Pharmacy pharmacy = createPharmacy();
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(pharmacyRepo.save(any(Pharmacy.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepo.findByEmail("admin@mail.com")).thenReturn(Optional.of(createUser()));
        when(adminActivityLogRepo.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Pharmacy result = adminService.approvePharmacy(1L, "approved", "admin@mail.com");
        assertEquals("approved", result.getApprovalStatus());
    }

    @Test
    void testRejectPharmacy() {
        Pharmacy pharmacy = createPharmacy();
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(pharmacyRepo.save(any(Pharmacy.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepo.findByEmail("admin@mail.com")).thenReturn(Optional.of(createUser()));
        when(adminActivityLogRepo.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Pharmacy result = adminService.approvePharmacy(1L, "rejected", "admin@mail.com");
        assertEquals("rejected", result.getApprovalStatus());
    }

    @Test
    void testApproveNurse() {
        Nurse nurse = createNurse();
        nurse.setApprovalStatus("pending");
        when(nurseRepo.findById(1L)).thenReturn(Optional.of(nurse));
        when(nurseRepo.save(any(Nurse.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepo.findByEmail("admin@mail.com")).thenReturn(Optional.of(createUser()));
        when(adminActivityLogRepo.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        Nurse result = adminService.approveNurse(1L, "approved", "admin@mail.com");
        assertEquals("approved", result.getApprovalStatus());
    }

    @Test
    void testBlockUser() {
        User user = createUser();
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(userRepo.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepo.findByEmail("admin@mail.com")).thenReturn(Optional.of(createUser()));
        when(adminActivityLogRepo.save(any(AdminActivityLog.class))).thenReturn(new AdminActivityLog());

        User result = adminService.blockUser(1L, "admin@mail.com");
        assertEquals("blocked", result.getStatus());
        assertFalse(result.getIsActive());
    }

    @Test
    void testGetDashboard() {
        when(userRepo.count()).thenReturn(10L);
        when(pharmacyRepo.count()).thenReturn(5L);
        when(nurseRepo.count()).thenReturn(3L);
        when(medicineRepo.count()).thenReturn(50L);
        when(pharmacyRepo.findByApprovalStatus("approved")).thenReturn(List.of(new Pharmacy(), new Pharmacy()));
        when(pharmacyRepo.findByApprovalStatus("pending")).thenReturn(List.of(new Pharmacy()));

        Map<String, Object> dashboard = adminService.getDashboard();
        assertEquals(10L, dashboard.get("totalUsers"));
        assertEquals(5L, dashboard.get("totalPharmacies"));
        assertEquals(3L, dashboard.get("totalNurses"));
        assertEquals(50L, dashboard.get("totalMedicines"));
    }

    // ==================== REVIEW TESTS (3) ====================

    @Test
    void testAddPharmacyReview() {
        PharmacyReviewRequest req = new PharmacyReviewRequest();
        req.setPharmacyId(1L);
        req.setRating(5);
        req.setReviewText("Great service!");

        PharmacyReview saved = new PharmacyReview();
        saved.setRating(5);

        when(userRepo.findByEmail("user@mail.com")).thenReturn(Optional.of(createUser()));
        when(pharmacyRepo.findById(1L)).thenReturn(Optional.of(createPharmacy()));
        when(pharmacyReviewRepo.save(any(PharmacyReview.class))).thenReturn(saved);

        PharmacyReview result = reviewService.addPharmacyReview("user@mail.com", req);
        assertEquals(5, result.getRating());
    }

    @Test
    void testAddNurseReview() {
        NurseReviewRequest req = new NurseReviewRequest();
        req.setNurseId(1L);
        req.setRequestId(1L);
        req.setRating(4);
        req.setReviewText("Very caring");

        NurseReview saved = new NurseReview();
        saved.setRating(4);

        when(userRepo.findByEmail("user@mail.com")).thenReturn(Optional.of(createUser()));
        when(nurseRepo.findById(1L)).thenReturn(Optional.of(createNurse()));
        when(nurseRequestRepo.findById(1L)).thenReturn(Optional.of(new NurseRequest()));
        when(nurseReviewRepo.save(any(NurseReview.class))).thenReturn(saved);

        NurseReview result = reviewService.addNurseReview("user@mail.com", req);
        assertEquals(4, result.getRating());
    }

    @Test
    void testGetPharmacyReviews() {
        List<PharmacyReview> reviews = List.of(new PharmacyReview(), new PharmacyReview());
        when(pharmacyReviewRepo.findByPharmacyPharmacyId(1L)).thenReturn(reviews);

        List<PharmacyReview> result = reviewService.getPharmacyReviews(1L);
        assertEquals(2, result.size());
    }

    // ==================== NOTIFICATION TESTS (3) ====================

    @Test
    void testGetUserNotifications() {
        when(userRepo.findByEmail("user@mail.com")).thenReturn(Optional.of(createUser()));
        when(notificationRepo.findByUserUserIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(new Notification(), new Notification()));

        List<Notification> result = notificationService.getUserNotifications("user@mail.com");
        assertEquals(2, result.size());
    }

    @Test
    void testMarkAsRead() {
        Notification notification = new Notification();
        notification.setNotificationId(1L);
        notification.setIsRead(false);

        when(notificationRepo.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepo.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.markAsRead(1L);
        assertTrue(result.getIsRead());
    }

    @Test
    void testCreateNotification() {
        when(userRepo.findById(1L)).thenReturn(Optional.of(createUser()));
        when(notificationRepo.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        Notification result = notificationService.createNotification(1L, "approval", "Approved", "Your pharmacy is approved");
        assertEquals("approval", result.getType());
        assertEquals("Approved", result.getTitle());
    }

    // ==================== HELPER METHODS ====================

    private User createUser() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");
        user.setEmail("test@mail.com");
        user.setPasswordHash("hashed");
        user.setRole("customer");
        user.setStatus("active");
        user.setIsActive(true);
        return user;
    }

    private Pharmacy createPharmacy() {
        Pharmacy p = new Pharmacy();
        p.setPharmacyId(1L);
        p.setPharmacyName("HealthPlus");
        p.setEmail("pharm@mail.com");
        p.setPasswordHash("hashed");
        p.setLicenseNumber("LIC-001");
        p.setApprovalStatus("pending");
        p.setLatitude(BigDecimal.valueOf(22.57));
        p.setLongitude(BigDecimal.valueOf(88.36));
        return p;
    }

    private PharmacyRegisterRequest createPharmacyRequest() {
        PharmacyRegisterRequest req = new PharmacyRegisterRequest();
        req.setOwnerName("Rajesh");
        req.setEmail("pharm@mail.com");
        req.setPassword("Pass@123");
        req.setPharmacyName("HealthPlus");
        req.setLicenseNumber("LIC-001");
        req.setAddress("MG Road");
        req.setCity("Kolkata");
        req.setState("West Bengal");
        req.setPincode("700001");
        req.setPhone("9876543210");
        return req;
    }

    private MedicineCategory createCategory() {
        MedicineCategory cat = new MedicineCategory();
        cat.setCategoryId(1L);
        cat.setCategoryName("Tablets");
        return cat;
    }

    private Medicine createMedicine(String name, double price, int stock) {
        Medicine m = new Medicine();
        m.setMedicineId(1L);
        m.setMedicineName(name);
        m.setPrice(BigDecimal.valueOf(price));
        m.setStockQuantity(stock);
        m.setPharmacy(createPharmacy());
        return m;
    }

    private Medicine createMedicineWithPharmacy(String name, double price, Pharmacy pharmacy) {
        Medicine m = new Medicine();
        m.setMedicineId((long) Math.abs(name.hashCode()));
        m.setMedicineName(name);
        m.setPrice(BigDecimal.valueOf(price));
        m.setStockQuantity(50);
        m.setPharmacy(pharmacy);
        return m;
    }

    private Nurse createNurse() {
        Nurse n = new Nurse();
        n.setNurseId(1L);
        n.setFullName("Priya Sharma");
        n.setEmail("priya@mail.com");
        n.setPasswordHash("hashed");
        n.setApprovalStatus("approved");
        n.setAvailabilityStatus("online");
        return n;
    }

    private NurseService createNurseService() {
        NurseService ns = new NurseService();
        ns.setServiceId(1L);
        ns.setServiceName("Home Injection");
        ns.setBasePrice(BigDecimal.valueOf(200));
        return ns;
    }
}
