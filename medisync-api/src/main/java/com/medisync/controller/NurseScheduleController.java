package com.medisync.controller;

import com.medisync.entity.Nurse;
import com.medisync.entity.NurseBlockedDate;
import com.medisync.entity.NurseSchedule;
import com.medisync.repository.NurseBlockedDateRepository;
import com.medisync.repository.NurseRepository;
import com.medisync.repository.NurseScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurses/schedule")
@RequiredArgsConstructor
public class NurseScheduleController {

    private final NurseScheduleRepository scheduleRepository;
    private final NurseBlockedDateRepository blockedDateRepository;
    private final NurseRepository nurseRepository;

    // ─── Get nurse's weekly schedule ─────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<NurseSchedule>> getMySchedule(Authentication auth) {
        Nurse nurse = getNurse(auth);
        return ResponseEntity.ok(scheduleRepository.findByNurseNurseId(nurse.getNurseId()));
    }

    // ─── Add a single slot (with overlap check) ─────────────────────────────────

    @PostMapping("/slot")
    public ResponseEntity<?> addSlot(Authentication auth, @RequestBody Map<String, Object> body) {
        Nurse nurse = getNurse(auth);

        String dayOfWeek = ((String) body.get("dayOfWeek")).toUpperCase();
        LocalTime startTime = LocalTime.parse((String) body.get("startTime"));
        LocalTime endTime = LocalTime.parse((String) body.get("endTime"));

        // Validate time range
        if (!endTime.isAfter(startTime)) {
            return ResponseEntity.badRequest().body(Map.of("error", "End time must be after start time"));
        }

        // Check for overlap with existing slots on same day
        List<NurseSchedule> existingSlots = scheduleRepository.findByNurseNurseIdAndDayOfWeek(nurse.getNurseId(), dayOfWeek);
        for (NurseSchedule existing : existingSlots) {
            if (timesOverlap(startTime, endTime, existing.getStartTime(), existing.getEndTime())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "This slot overlaps with existing slot: " + existing.getStartTime() + " - " + existing.getEndTime()
                ));
            }
        }

        NurseSchedule schedule = new NurseSchedule();
        schedule.setNurse(nurse);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        schedule.setIsActive(true);
        scheduleRepository.save(schedule);

        return ResponseEntity.ok(schedule);
    }

    // ─── Save/Replace entire weekly schedule (with overlap validation) ───────────

    @PostMapping
    @Transactional
    public ResponseEntity<?> saveSchedule(Authentication auth, @RequestBody List<Map<String, Object>> slots) {
        Nurse nurse = getNurse(auth);

        // Validate no overlaps within the submitted slots
        for (int i = 0; i < slots.size(); i++) {
            String day1 = ((String) slots.get(i).get("dayOfWeek")).toUpperCase();
            LocalTime start1 = LocalTime.parse((String) slots.get(i).get("startTime"));
            LocalTime end1 = LocalTime.parse((String) slots.get(i).get("endTime"));

            if (!end1.isAfter(start1)) {
                return ResponseEntity.badRequest().body(Map.of("error",
                        "Slot " + (i + 1) + ": End time must be after start time"));
            }

            for (int j = i + 1; j < slots.size(); j++) {
                String day2 = ((String) slots.get(j).get("dayOfWeek")).toUpperCase();
                if (!day1.equals(day2)) continue;

                LocalTime start2 = LocalTime.parse((String) slots.get(j).get("startTime"));
                LocalTime end2 = LocalTime.parse((String) slots.get(j).get("endTime"));

                if (timesOverlap(start1, end1, start2, end2)) {
                    return ResponseEntity.badRequest().body(Map.of("error",
                            "Overlap detected on " + day1 + ": " + start1 + "-" + end1 + " and " + start2 + "-" + end2));
                }
            }
        }

        // Delete existing and insert new
        List<NurseSchedule> existing = scheduleRepository.findByNurseNurseId(nurse.getNurseId());
        scheduleRepository.deleteAll(existing);

        for (Map<String, Object> slot : slots) {
            NurseSchedule schedule = new NurseSchedule();
            schedule.setNurse(nurse);
            schedule.setDayOfWeek(((String) slot.get("dayOfWeek")).toUpperCase());
            schedule.setStartTime(LocalTime.parse((String) slot.get("startTime")));
            schedule.setEndTime(LocalTime.parse((String) slot.get("endTime")));
            schedule.setIsActive(slot.get("isActive") != null ? (Boolean) slot.get("isActive") : true);
            scheduleRepository.save(schedule);
        }

        return ResponseEntity.ok(Map.of("message", "Schedule updated successfully",
                "slots", scheduleRepository.findByNurseNurseId(nurse.getNurseId())));
    }

    // ─── Toggle a specific schedule slot active/inactive ─────────────────────────

    @PutMapping("/{scheduleId}/toggle")
    public ResponseEntity<?> toggleSlot(@PathVariable Long scheduleId) {
        NurseSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setIsActive(!Boolean.TRUE.equals(schedule.getIsActive()));
        scheduleRepository.save(schedule);
        return ResponseEntity.ok(schedule);
    }

    // ─── Delete a schedule slot ──────────────────────────────────────────────────

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<?> deleteSlot(@PathVariable Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
        return ResponseEntity.ok(Map.of("message", "Slot deleted"));
    }

    // ─── Get blocked dates ───────────────────────────────────────────────────────

    @GetMapping("/blocked-dates")
    public ResponseEntity<List<NurseBlockedDate>> getBlockedDates(Authentication auth) {
        Nurse nurse = getNurse(auth);
        return ResponseEntity.ok(blockedDateRepository.findByNurseNurseId(nurse.getNurseId()));
    }

    // ─── Add a blocked date ──────────────────────────────────────────────────────

    @PostMapping("/blocked-dates")
    public ResponseEntity<?> addBlockedDate(Authentication auth, @RequestBody Map<String, String> body) {
        Nurse nurse = getNurse(auth);
        LocalDate date = LocalDate.parse(body.get("date"));
        String reason = body.getOrDefault("reason", "");

        if (blockedDateRepository.existsByNurseNurseIdAndBlockedDate(nurse.getNurseId(), date)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Date is already blocked"));
        }

        NurseBlockedDate blockedDate = new NurseBlockedDate();
        blockedDate.setNurse(nurse);
        blockedDate.setBlockedDate(date);
        blockedDate.setReason(reason);
        blockedDateRepository.save(blockedDate);

        return ResponseEntity.ok(Map.of("message", "Date blocked successfully", "blockedDate", blockedDate));
    }

    // ─── Remove a blocked date ───────────────────────────────────────────────────

    @DeleteMapping("/blocked-dates/{blockedId}")
    public ResponseEntity<?> removeBlockedDate(@PathVariable Long blockedId) {
        blockedDateRepository.deleteById(blockedId);
        return ResponseEntity.ok(Map.of("message", "Blocked date removed"));
    }

    // ─── Public: Get a nurse's schedule (for user to see available slots) ────────

    @GetMapping("/{nurseId}")
    public ResponseEntity<List<NurseSchedule>> getNurseSchedule(@PathVariable Long nurseId) {
        return ResponseEntity.ok(scheduleRepository.findByNurseNurseIdAndIsActiveTrue(nurseId));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    private Nurse getNurse(Authentication auth) {
        return nurseRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
    }

    /**
     * Check if two time ranges overlap.
     * Two ranges [s1, e1) and [s2, e2) overlap if s1 < e2 AND s2 < e1
     */
    private boolean timesOverlap(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
        return start1.isBefore(end2) && start2.isBefore(end1);
    }
}
