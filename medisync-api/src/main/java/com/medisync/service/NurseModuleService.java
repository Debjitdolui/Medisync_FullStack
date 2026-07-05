package com.medisync.service;

import com.medisync.dto.NurseRegisterRequest;
import com.medisync.dto.NurseRequestDto;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NurseModuleService {

    private final NurseRepository nurseRepository;
    private final NurseServiceRepository nurseServiceRepository;
    private final NurseRequestRepository nurseRequestRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public Nurse register(NurseRegisterRequest req) {
        if (nurseRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists");
        if (nurseRepository.existsByLicenseNumber(req.getLicenseNumber()))
            throw new RuntimeException("License number already exists");
        Nurse nurse = new Nurse();
        nurse.setFullName(req.getFullName());
        nurse.setEmail(req.getEmail());
        nurse.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        nurse.setPhone(req.getPhone());
        nurse.setQualification(req.getQualification());
        nurse.setLicenseNumber(req.getLicenseNumber());
        nurse.setSpecialization(req.getSpecialization());
        return nurseRepository.save(nurse);
    }

    public Nurse updateAvailability(String email, String status) {
        Nurse nurse = nurseRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        nurse.setAvailabilityStatus(status);
        return nurseRepository.save(nurse);
    }

    public List<Nurse> getAvailableNurses() {
        return nurseRepository.findByAvailabilityStatusAndApprovalStatus("online", "approved");
    }

    public Nurse getNurseById(Long id) {
        return nurseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
    }

    public List<NurseService> getServices() {
        return nurseServiceRepository.findAll();
    }

    public NurseRequest createRequest(String patientEmail, NurseRequestDto dto) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Nurse nurse = nurseRepository.findById(dto.getNurseId())
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        NurseService service = nurseServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));
        NurseRequest request = new NurseRequest();
        request.setPatient(patient);
        request.setNurse(nurse);
        request.setService(service);
        request.setAddress(dto.getAddress());
        request.setHealthIssue(dto.getHealthIssue());
        request.setRequestDate(dto.getRequestDate());
        request.setPreferredTime(dto.getPreferredTime());
        NurseRequest saved = nurseRequestRepository.save(request);

        // Notify the nurse about new booking request
        notificationService.notifyNurse(nurse.getEmail(), "NEW_REQUEST",
                "New Booking Request",
                "You have a new " + service.getServiceName() + " request from " + patient.getUsername() + " for " + dto.getRequestDate());

        return saved;
    }

    public List<NurseRequest> getPatientRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return nurseRequestRepository.findByPatientUserId(user.getUserId());
    }

    public List<NurseRequest> getNurseRequests(String email) {
        Nurse nurse = nurseRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        return nurseRequestRepository.findByNurseNurseId(nurse.getNurseId());
    }

    public NurseRequest updateRequestStatus(Long requestId, String status) {
        NurseRequest request = nurseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        request.setRequestStatus(status);
        NurseRequest saved = nurseRequestRepository.save(request);

        // Notify the patient about status change
        String patientEmail = request.getPatient().getEmail();
        String nurseName = request.getNurse().getFullName();
        String title = "Nurse Request " + status.substring(0, 1).toUpperCase() + status.substring(1);
        String message = switch (status) {
            case "accepted" -> "Your request has been accepted by " + nurseName + ". They will arrive on " + request.getRequestDate();
            case "in_progress" -> nurseName + " is on the way for your " + request.getService().getServiceName();
            case "completed" -> "Your " + request.getService().getServiceName() + " with " + nurseName + " is completed. Please leave a review!";
            case "cancelled" -> "Your request with " + nurseName + " has been cancelled.";
            default -> "Your nurse request status has been updated to: " + status;
        };
        notificationService.notifyUser(patientEmail, "REQUEST_UPDATE", title, message);

        return saved;
    }

    public Nurse getProfile(String email) {
        return nurseRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
    }

    public Nurse updateProfile(String email, java.util.Map<String, String> fields) {
        Nurse nurse = nurseRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        if (fields.containsKey("fullName")) nurse.setFullName(fields.get("fullName"));
        if (fields.containsKey("phone")) nurse.setPhone(fields.get("phone"));
        if (fields.containsKey("qualification")) nurse.setQualification(fields.get("qualification"));
        if (fields.containsKey("specialization")) nurse.setSpecialization(fields.get("specialization"));
        return nurseRepository.save(nurse);
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        Nurse nurse = nurseRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        if (!passwordEncoder.matches(currentPassword, nurse.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        nurse.setPasswordHash(passwordEncoder.encode(newPassword));
        nurseRepository.save(nurse);
    }
}
