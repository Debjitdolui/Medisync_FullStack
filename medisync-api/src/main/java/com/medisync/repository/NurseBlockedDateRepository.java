package com.medisync.repository;

import com.medisync.entity.NurseBlockedDate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface NurseBlockedDateRepository extends JpaRepository<NurseBlockedDate, Long> {
    List<NurseBlockedDate> findByNurseNurseId(Long nurseId);
    List<NurseBlockedDate> findByNurseNurseIdAndBlockedDate(Long nurseId, LocalDate date);
    boolean existsByNurseNurseIdAndBlockedDate(Long nurseId, LocalDate date);
    void deleteByNurseNurseIdAndBlockedDate(Long nurseId, LocalDate date);
}
