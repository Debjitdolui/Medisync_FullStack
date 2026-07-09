package com.medisync.repository;

import com.medisync.entity.NurseSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NurseScheduleRepository extends JpaRepository<NurseSchedule, Long> {
    List<NurseSchedule> findByNurseNurseId(Long nurseId);
    List<NurseSchedule> findByNurseNurseIdAndDayOfWeek(Long nurseId, String dayOfWeek);
    List<NurseSchedule> findByNurseNurseIdAndIsActiveTrue(Long nurseId);
    void deleteByNurseNurseIdAndDayOfWeek(Long nurseId, String dayOfWeek);
}
