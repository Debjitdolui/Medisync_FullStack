package com.medisync.repository;

import com.medisync.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NurseRepository extends JpaRepository<Nurse, Long> {
    Optional<Nurse> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByLicenseNumber(String licenseNumber);
    List<Nurse> findByAvailabilityStatusAndApprovalStatus(String availability, String approval);
    List<Nurse> findByApprovalStatus(String status);
}
