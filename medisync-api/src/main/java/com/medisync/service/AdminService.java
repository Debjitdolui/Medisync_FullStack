package com.medisync.service;

import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final NotificationService notificationService;
    private final NurseRequestRepository nurseRequestRepository;
    private final PharmacyReviewRepository pharmacyReviewRepository;
    private final NurseReviewRepository nurseReviewRepository;

    public List<Pharmacy> getAllPharmacies() {
        return pharmacyRepository.findAll();
    }

    public Page<Pharmacy> getAllPharmacies(Pageable pageable) {
        return pharmacyRepository.findAll(pageable);
    }

    public List<Nurse> getAllNurses() {
        return nurseRepository.findAll();
    }

    public Page<Nurse> getAllNurses(Pageable pageable) {
        return nurseRepository.findAll(pageable);
    }

    public Pharmacy approvePharmacy(Long pharmacyId, String status, String adminEmail) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        pharmacy.setApprovalStatus(status);
        pharmacyRepository.save(pharmacy);
        logActivity(adminEmail, "PHARMACY_" + status.toUpperCase(), "Pharmacy", pharmacyId, "Pharmacy " + pharmacy.getPharmacyName() + " " + status);

        // Notify pharmacy about approval/rejection
        String title = "approved".equals(status) ? "Pharmacy Approved!" : "Pharmacy Registration Rejected";
        String message = "approved".equals(status)
                ? "Congratulations! Your pharmacy '" + pharmacy.getPharmacyName() + "' has been approved. You can now manage your inventory."
                : "Your pharmacy '" + pharmacy.getPharmacyName() + "' registration has been rejected. Please contact support for details.";
        notificationService.notifyPharmacy(pharmacy.getEmail(), "APPROVAL_UPDATE", title, message);

        return pharmacy;
    }

    public Nurse approveNurse(Long nurseId, String status, String adminEmail) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        nurse.setApprovalStatus(status);
        nurseRepository.save(nurse);
        logActivity(adminEmail, "NURSE_" + status.toUpperCase(), "Nurse", nurseId, "Nurse " + nurse.getFullName() + " " + status);

        // Notify nurse about approval/rejection
        String title = "approved".equals(status) ? "Nurse Profile Approved!" : "Nurse Registration Rejected";
        String message = "approved".equals(status)
                ? "Congratulations! Your nurse profile has been approved. You can now set your availability and accept requests."
                : "Your nurse registration has been rejected. Please contact support for details.";
        notificationService.notifyNurse(nurse.getEmail(), "APPROVAL_UPDATE", title, message);

        return nurse;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
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

    public Page<AdminActivityLog> getLogs(Pageable pageable) {
        return adminActivityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
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

    // ─── Report Data for Excel Export ─────────────────────────────────────────────

    public List<Map<String, Object>> getUsersReportData() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> data = new ArrayList<>();
        for (User u : users) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("userId", u.getUserId());
            row.put("username", u.getUsername());
            row.put("email", u.getEmail());
            row.put("phone", u.getPhone());
            row.put("role", u.getRole());
            row.put("status", u.getStatus());
            row.put("totalBookings", nurseRequestRepository.findByPatientUserId(u.getUserId()).size());
            row.put("registeredOn", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            data.add(row);
        }
        return data;
    }

    public List<Map<String, Object>> getPharmaciesReportData() {
        List<Pharmacy> pharmacies = pharmacyRepository.findAll();
        List<Map<String, Object>> data = new ArrayList<>();
        for (Pharmacy p : pharmacies) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("pharmacyId", p.getPharmacyId());
            row.put("pharmacyName", p.getPharmacyName());
            row.put("ownerName", p.getOwnerName());
            row.put("email", p.getEmail());
            row.put("city", p.getCity());
            row.put("phone", p.getPhone());
            row.put("approvalStatus", p.getApprovalStatus());
            row.put("blocked", Boolean.TRUE.equals(p.getIsBlocked()) ? "Yes" : "No");
            row.put("totalMedicines", medicineRepository.findByPharmacyPharmacyId(p.getPharmacyId()).size());
            List<PharmacyReview> reviews = pharmacyReviewRepository.findByPharmacyPharmacyId(p.getPharmacyId());
            double avgRating = reviews.isEmpty() ? 0 : reviews.stream().mapToInt(PharmacyReview::getRating).average().orElse(0);
            row.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            row.put("totalReviews", reviews.size());
            row.put("registeredOn", p.getCreatedAt() != null ? p.getCreatedAt().toString() : "");
            data.add(row);
        }
        return data;
    }

    public List<Map<String, Object>> getNursesReportData() {
        List<Nurse> nurses = nurseRepository.findAll();
        List<Map<String, Object>> data = new ArrayList<>();
        for (Nurse n : nurses) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("nurseId", n.getNurseId());
            row.put("fullName", n.getFullName());
            row.put("email", n.getEmail());
            row.put("phone", n.getPhone());
            row.put("specialization", n.getSpecialization());
            row.put("qualification", n.getQualification());
            row.put("approvalStatus", n.getApprovalStatus());
            row.put("blocked", Boolean.TRUE.equals(n.getIsBlocked()) ? "Yes" : "No");
            row.put("availability", n.getAvailabilityStatus());
            List<NurseRequest> requests = nurseRequestRepository.findByNurseNurseId(n.getNurseId());
            row.put("totalRequests", requests.size());
            long completed = requests.stream().filter(r -> "completed".equals(r.getRequestStatus())).count();
            row.put("completedRequests", completed);
            List<NurseReview> reviews = nurseReviewRepository.findByNurseNurseId(n.getNurseId());
            double avgRating = reviews.isEmpty() ? 0 : reviews.stream().mapToInt(NurseReview::getRating).average().orElse(0);
            row.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            row.put("registeredOn", n.getCreatedAt() != null ? n.getCreatedAt().toString() : "");
            data.add(row);
        }
        return data;
    }

    // ─── Block/Unblock Pharmacy ─────────────────────────────────────────────────

    public Pharmacy blockPharmacy(Long pharmacyId, String adminEmail) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        pharmacy.setIsBlocked(true);
        pharmacyRepository.save(pharmacy);
        logActivity(adminEmail, "BLOCK_PHARMACY", "Pharmacy", pharmacyId, "Blocked pharmacy " + pharmacy.getPharmacyName());
        notificationService.notifyPharmacy(pharmacy.getEmail(), "ACCOUNT_BLOCKED",
                "Account Blocked",
                "Your pharmacy '" + pharmacy.getPharmacyName() + "' has been blocked due to suspicious activity. Contact support for details.");
        return pharmacy;
    }

    public Pharmacy unblockPharmacy(Long pharmacyId, String adminEmail) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        pharmacy.setIsBlocked(false);
        pharmacyRepository.save(pharmacy);
        logActivity(adminEmail, "UNBLOCK_PHARMACY", "Pharmacy", pharmacyId, "Unblocked pharmacy " + pharmacy.getPharmacyName());
        notificationService.notifyPharmacy(pharmacy.getEmail(), "ACCOUNT_UNBLOCKED",
                "Account Unblocked",
                "Your pharmacy '" + pharmacy.getPharmacyName() + "' has been unblocked. You can now login and manage your inventory.");
        return pharmacy;
    }

    // ─── Block/Unblock Nurse ─────────────────────────────────────────────────────

    public Nurse blockNurse(Long nurseId, String adminEmail) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        nurse.setIsBlocked(true);
        nurse.setAvailabilityStatus("offline");
        nurseRepository.save(nurse);
        logActivity(adminEmail, "BLOCK_NURSE", "Nurse", nurseId, "Blocked nurse " + nurse.getFullName());
        notificationService.notifyNurse(nurse.getEmail(), "ACCOUNT_BLOCKED",
                "Account Blocked",
                "Your nurse account has been blocked due to suspicious activity. Contact support for details.");
        return nurse;
    }

    public Nurse unblockNurse(Long nurseId, String adminEmail) {
        Nurse nurse = nurseRepository.findById(nurseId)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        nurse.setIsBlocked(false);
        nurseRepository.save(nurse);
        logActivity(adminEmail, "UNBLOCK_NURSE", "Nurse", nurseId, "Unblocked nurse " + nurse.getFullName());
        notificationService.notifyNurse(nurse.getEmail(), "ACCOUNT_UNBLOCKED",
                "Account Unblocked",
                "Your nurse account has been unblocked. You can now set your availability and accept requests.");
        return nurse;
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
