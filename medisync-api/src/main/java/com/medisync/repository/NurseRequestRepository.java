package com.medisync.repository;

import com.medisync.entity.NurseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface NurseRequestRepository extends JpaRepository<NurseRequest, Long> {
    List<NurseRequest> findByPatientUserId(Long patientId);
    List<NurseRequest> findByNurseNurseId(Long nurseId);

    // Find active bookings for a nurse on a specific date (pending within buffer or accepted/in_progress)
    @Query("SELECT r FROM NurseRequest r WHERE r.nurse.nurseId = :nurseId AND r.requestDate = :date " +
           "AND r.requestStatus IN ('pending', 'accepted', 'in_progress')")
    List<NurseRequest> findActiveBookingsForNurseOnDate(@Param("nurseId") Long nurseId, @Param("date") LocalDate date);

    // Find all pending requests that have expired (past buffer time)
    @Query("SELECT r FROM NurseRequest r WHERE r.requestStatus = 'pending' AND r.expiresAt < :now")
    List<NurseRequest> findExpiredPendingRequests(@Param("now") LocalDateTime now);

    // Find requests by booking group
    List<NurseRequest> findByBookingGroupId(String bookingGroupId);
}
