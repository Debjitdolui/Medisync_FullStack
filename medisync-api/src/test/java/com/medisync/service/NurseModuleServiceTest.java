package com.medisync.service;

import com.medisync.dto.NurseRegisterRequest;
import com.medisync.dto.NurseRequestDto;
import com.medisync.entity.*;
import com.medisync.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NurseModuleServiceTest {

    @Mock private NurseRepository nurseRepository;
    @Mock private NurseServiceRepository nurseServiceRepository;
    @Mock private NurseRequestRepository nurseRequestRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private NurseModuleService nurseModuleService;

    @Test
    void testRegister_Success() {
        NurseRegisterRequest req = new NurseRegisterRequest();
        req.setFullName("Jane Doe");
        req.setEmail("jane@mail.com");
        req.setPassword("pass123");
        req.setPhone("9876543210");
        req.setQualification("BSc Nursing");
        req.setLicenseNumber("LIC001");
        req.setSpecialization("Pediatrics");

        when(nurseRepository.existsByEmail("jane@mail.com")).thenReturn(false);
        when(nurseRepository.existsByLicenseNumber("LIC001")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("hashed");

        Nurse nurse = new Nurse();
        nurse.setNurseId(1L);
        nurse.setFullName("Jane Doe");
        nurse.setEmail("jane@mail.com");
        when(nurseRepository.save(any(Nurse.class))).thenReturn(nurse);

        Nurse result = nurseModuleService.register(req);

        assertNotNull(result);
        assertEquals("Jane Doe", result.getFullName());
        verify(nurseRepository).save(any(Nurse.class));
    }

    @Test
    void testRegister_DuplicateEmail() {
        NurseRegisterRequest req = new NurseRegisterRequest();
        req.setEmail("jane@mail.com");

        when(nurseRepository.existsByEmail("jane@mail.com")).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> nurseModuleService.register(req));
        assertEquals("Email already exists", ex.getMessage());
    }

    @Test
    void testCreateRequest_Success() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("patient");
        user.setEmail("patient@mail.com");

        Nurse nurse = new Nurse();
        nurse.setNurseId(1L);
        nurse.setEmail("nurse@mail.com");

        NurseService service = new NurseService();
        service.setServiceId(1L);
        service.setServiceName("Home Nursing");
        service.setBasePrice(new BigDecimal("500"));

        NurseRequestDto dto = new NurseRequestDto();
        dto.setNurseId(1L);
        dto.setServiceId(1L);
        dto.setAddress("123 Street");
        dto.setHealthIssue("Fever");
        dto.setRequestDate(LocalDate.now());
        dto.setPreferredTime("10:00 AM");

        when(userRepository.findByEmail("patient@mail.com")).thenReturn(Optional.of(user));
        when(nurseRepository.findById(1L)).thenReturn(Optional.of(nurse));
        when(nurseServiceRepository.findById(1L)).thenReturn(Optional.of(service));

        NurseRequest request = new NurseRequest();
        request.setRequestId(1L);
        request.setPatient(user);
        request.setNurse(nurse);
        request.setService(service);
        when(nurseRequestRepository.save(any(NurseRequest.class))).thenReturn(request);

        NurseRequest result = nurseModuleService.createRequest("patient@mail.com", dto);

        assertNotNull(result);
        assertEquals(1L, result.getRequestId());
        verify(nurseRequestRepository).save(any(NurseRequest.class));
        verify(notificationService).notifyNurse(eq("nurse@mail.com"), anyString(), anyString(), anyString());
    }

    @Test
    void testUpdateRequestStatus() {
        User patient = new User();
        patient.setEmail("patient@mail.com");

        Nurse nurse = new Nurse();
        nurse.setFullName("Jane Doe");

        NurseService service = new NurseService();
        service.setServiceName("Home Nursing");

        NurseRequest request = new NurseRequest();
        request.setRequestId(1L);
        request.setRequestStatus("pending");
        request.setPatient(patient);
        request.setNurse(nurse);
        request.setService(service);
        request.setRequestDate(LocalDate.now());

        when(nurseRequestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(nurseRequestRepository.save(any(NurseRequest.class))).thenReturn(request);

        NurseRequest result = nurseModuleService.updateRequestStatus(1L, "accepted");

        assertEquals("accepted", result.getRequestStatus());
        verify(nurseRequestRepository).save(any(NurseRequest.class));
        verify(notificationService).notifyUser(eq("patient@mail.com"), anyString(), anyString(), anyString());
    }
}
