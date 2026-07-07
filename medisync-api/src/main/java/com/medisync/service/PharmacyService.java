package com.medisync.service;

import com.medisync.dto.PharmacyRegisterRequest;
import com.medisync.dto.PharmacyUpdateRequest;
import com.medisync.entity.Pharmacy;
import com.medisync.repository.MedicineRepository;
import com.medisync.repository.PharmacyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PharmacyService {

    private final PharmacyRepository pharmacyRepository;
    private final MedicineRepository medicineRepository;
    private final PasswordEncoder passwordEncoder;
    private final PincodeCoordinateService pincodeCoordinateService;

    public Pharmacy register(PharmacyRegisterRequest req) {
        if (pharmacyRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        if (pharmacyRepository.existsByLicenseNumber(req.getLicenseNumber()))
            throw new RuntimeException("License number already registered");

        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setOwnerName(req.getOwnerName());
        pharmacy.setEmail(req.getEmail());
        pharmacy.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        pharmacy.setPharmacyName(req.getPharmacyName());
        pharmacy.setLicenseNumber(req.getLicenseNumber());
        pharmacy.setAddress(req.getAddress());
        pharmacy.setCity(req.getCity());
        pharmacy.setState(req.getState());
        pharmacy.setPincode(req.getPincode());
        pharmacy.setPhone(req.getPhone());

        // Auto-fill lat/long from pincode if not provided
        if (req.getLatitude() != null && req.getLongitude() != null) {
            pharmacy.setLatitude(req.getLatitude());
            pharmacy.setLongitude(req.getLongitude());
        } else if (req.getPincode() != null && !req.getPincode().isBlank()) {
            java.math.BigDecimal[] coords = pincodeCoordinateService.getCoordinates(req.getPincode());
            pharmacy.setLatitude(coords[0]);
            pharmacy.setLongitude(coords[1]);
        }

        pharmacy.setApprovalStatus("pending");
        return pharmacyRepository.save(pharmacy);
    }

    public Pharmacy getById(Long id) {
        return pharmacyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
    }

    public Pharmacy update(Long id, PharmacyUpdateRequest req) {
        Pharmacy pharmacy = getById(id);
        pharmacy.setOwnerName(req.getOwnerName());
        pharmacy.setPharmacyName(req.getPharmacyName());
        pharmacy.setLicenseNumber(req.getLicenseNumber());
        pharmacy.setAddress(req.getAddress());
        pharmacy.setCity(req.getCity());
        pharmacy.setState(req.getState());
        pharmacy.setPincode(req.getPincode());
        pharmacy.setPhone(req.getPhone());

        // Auto-fill lat/long from pincode if not provided
        if (req.getLatitude() != null && req.getLongitude() != null) {
            pharmacy.setLatitude(req.getLatitude());
            pharmacy.setLongitude(req.getLongitude());
        } else if (req.getPincode() != null && !req.getPincode().isBlank()) {
            java.math.BigDecimal[] coords = pincodeCoordinateService.getCoordinates(req.getPincode());
            pharmacy.setLatitude(coords[0]);
            pharmacy.setLongitude(coords[1]);
        }

        return pharmacyRepository.save(pharmacy);
    }

    public Map<String, Object> getDashboard(String email) {
        Pharmacy pharmacy = pharmacyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        int medicineCount = medicineRepository.findByPharmacyPharmacyId(pharmacy.getPharmacyId()).size();
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("pharmacy", pharmacy);
        dashboard.put("medicineCount", medicineCount);
        return dashboard;
    }

    public List<Pharmacy> listApproved() {
        return pharmacyRepository.findByApprovalStatus("approved");
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        Pharmacy pharmacy = pharmacyRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        if (!passwordEncoder.matches(currentPassword, pharmacy.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        pharmacy.setPasswordHash(passwordEncoder.encode(newPassword));
        pharmacyRepository.save(pharmacy);
    }
}
