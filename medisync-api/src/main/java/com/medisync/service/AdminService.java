package com.medisync.service;

import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final NurseRepository nurseRepository;
    private final MedicineRepository medicineRepository;
    private final AdminActivityLogRepository adminActivityLogRepository;

    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepository.findAll();
    }

    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    public Pharmacy approvePharmacy(Long pharmacyId, String status, String adminEmail) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        pharmacy.setApprovalStatus(status);
        pharmacyRepository.save(pharmacy);
        logActivity(adminEmail, "PHARMACY_" + status.toUpperCase(), "Pharmacy", pharmacyId, "Pharmacy " + pharmacy.getPharmacyName() + " " + status);
        return pharmacy;
    }

    public Nurse approveNurse(Long nurseId, String status, String adminEmail) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        nurse.setApprovalStatus(status);
        nurseRepository.save(nurse);
        logActivity(adminEmail, "NURSE_" + status.toUpperCase(), "Nurse", nurseId, "Nurse " + nurse.getFullName() + " " + status);
        return nurse;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User blockUser(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("blocked");
        user.setIsActive(false);
        userRepository.save(user);
        logActivity(adminEmail, "BLOCK_USER", "User", userId, "Blocked user " + user.getEmail());
        return user;
    }

    public User unblockUser(Long userId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("active");
        user.setIsActive(true);
        userRepository.save(user);
        logActivity(adminEmail, "UNBLOCK_USER", "User", userId, "Unblocked user " + user.getEmail());
        return user;
    }

    public Map<String, Object> getDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalUsers", userRepository.count());
        dashboard.put("totalPharmacies", pharmacyRepository.count());
        dashboard.put("approvedPharmacies", pharmacyRepository.findByApprovalStatus("approved").size());
        dashboard.put("pendingPharmacies", pharmacyRepository.findByApprovalStatus("pending").size());
        dashboard.put("totalNurses", nurseRepository.count());
        dashboard.put("totalMedicines", medicineRepository.count());
        return dashboard;
    }

    public List<AdminActivityLog> getLogs() {
        return adminActivityLogRepository.findAllByOrderByCreatedAtDesc();
    }

    public Map<String, Object> getReports() {
        Map<String, Object> reports = new HashMap<>();
        reports.put("totalUsers", userRepository.count());
        reports.put("totalPharmacies", pharmacyRepository.count());
        reports.put("approvedPharmacies", pharmacyRepository.findByApprovalStatus("approved").size());
        reports.put("pendingPharmacies", pharmacyRepository.findByApprovalStatus("pending").size());
        reports.put("rejectedPharmacies", pharmacyRepository.findByApprovalStatus("rejected").size());
        reports.put("totalNurses", nurseRepository.count());
        reports.put("approvedNurses", nurseRepository.findByApprovalStatus("approved").size());
        reports.put("pendingNurses", nurseRepository.findByApprovalStatus("pending").size());
        reports.put("totalMedicines", medicineRepository.count());
        return reports;
    }

    private void logActivity(String adminEmail, String action, String entityType, Long entityId, String details) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        AdminActivityLog log = new AdminActivityLog();
        log.setAdmin(admin);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        adminActivityLogRepository.save(log);
    }
}
