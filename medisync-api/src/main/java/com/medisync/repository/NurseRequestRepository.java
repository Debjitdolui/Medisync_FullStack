package com.medisync.repository;

import com.medisync.entity.NurseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NurseRequestRepository extends JpaRepository<NurseRequest, Long> {
    List<NurseRequest> findByPatientUserId(Long patientId);
    List<NurseRequest> findByNurseNurseId(Long nurseId);
}
