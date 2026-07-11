package com.medisync.service;

import com.medisync.dto.NurseRegisterRequest;
import com.medisync.dto.NurseRequestDto;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NurseModuleService {

    private final NurseRepository nurseRepository;
    private final NurseServiceRepository nurseServiceRepository;
    private final NurseRequestRepository nurseRequestRepository;
    private final NurseScheduleRepository nurseScheduleRepository;
    private final NurseBlockedDateRepository nurseBlockedDateRepository;
    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public Nurse register(NurseRegisterRequest req) {
        if (nurseRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists");
        if (pharmacyRepository.existsByEmail(req.getEmail()))
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

        // Set offered services
        if (req.getServiceIds() != null && !req.getServiceIds().isEmpty()) {
            Set<NurseService> services = new HashSet<>(nurseServiceRepository.findAllById(req.getServiceIds()));
            nurse.setOfferedServices(services);
        }

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

    public List<Nurse> getAvailableNursesByService(Long serviceId) {
        List<Nurse> availableNurses = nurseRepository.findByAvailabilityStatusAndApprovalStatus("online", "approved");
        return availableNurses.stream()
                .filter(nurse -> nurse.getOfferedServices().stream()
                        .anyMatch(s -> s.getServiceId().equals(serviceId)))
                .toList();
    }

    public Nurse getNurseById(Long id) {
        return nurseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
    }

    public List<NurseService> getServices() {
        return nurseServiceRepository.findAll();
    }

    // ─── Slot Availability Logic ─────────────────────────────────────────────────

    private static final int MAX_DAILY_WORK_MINUTES = 480; // 8 hours

    /**
     * Get available time slots for a nurse on a specific date for a given service.
     * Considers: weekly schedule, blocked dates, existing bookings, service duration, 8hr daily limit.
     */
    public List<String> getAvailableSlots(Long nurseId, LocalDate date, Long serviceId) {
        // 1. Check if date is blocked
        if (nurseBlockedDateRepository.existsByNurseNurseIdAndBlockedDate(nurseId, date)) {
            return Collections.emptyList();
        }

        // 2. Get service duration
        NurseService service = nurseServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        int durationMinutes = service.getDurationMinutes() != null ? service.getDurationMinutes() : 60;

        // 3. Get nurse's schedule for that day of week
        String dayOfWeek = date.getDayOfWeek().name();
        List<NurseSchedule> schedules = nurseScheduleRepository.findByNurseNurseIdAndDayOfWeek(nurseId, dayOfWeek);
        schedules = schedules.stream().filter(s -> Boolean.TRUE.equals(s.getIsActive())).toList();

        if (schedules.isEmpty()) {
            return Collections.emptyList();
        }

        // 4. Get existing bookings (pending/accepted/in_progress) for this date
        List<NurseRequest> activeBookings = nurseRequestRepository.findActiveBookingsForNurseOnDate(nurseId, date);

        // 5. Calculate total booked minutes for the day
        int bookedMinutes = 0;
        for (NurseRequest booking : activeBookings) {
            if (booking.getService() != null && booking.getService().getDurationMinutes() != null) {
                bookedMinutes += booking.getService().getDurationMinutes();
            } else {
                bookedMinutes += 60; // default 1 hour if unknown
            }
        }

        // 6. Check if adding this service would exceed daily limit
        if (bookedMinutes + durationMinutes > MAX_DAILY_WORK_MINUTES) {
            return Collections.emptyList(); // Day is full
        }

        // 7. Get booked time ranges
        List<long[]> bookedRanges = new ArrayList<>();
        for (NurseRequest booking : activeBookings) {
            if (booking.getTimeSlot() != null && booking.getTimeSlot().contains("-")) {
                String[] parts = booking.getTimeSlot().split("-");
                LocalTime bStart = LocalTime.parse(parts[0].trim());
                LocalTime bEnd = LocalTime.parse(parts[1].trim());
                bookedRanges.add(new long[]{bStart.toSecondOfDay(), bEnd.toSecondOfDay()});
            }
        }

        // 8. Generate duration-based slots from nurse's windows
        List<String> allSlots = new ArrayList<>();
        for (NurseSchedule schedule : schedules) {
            LocalTime windowStart = schedule.getStartTime();
            LocalTime windowEnd = schedule.getEndTime();

            // Generate slots of serviceDuration length within this window
            LocalTime slotStart = windowStart;
            while (true) {
                LocalTime slotEnd = slotStart.plusMinutes(durationMinutes);

                // Check if slot fits within window
                if (slotEnd.isAfter(windowEnd)) break;

                // Check if slot overlaps with any booked range
                long sStart = slotStart.toSecondOfDay();
                long sEnd = slotEnd.toSecondOfDay();
                boolean overlaps = bookedRanges.stream().anyMatch(range ->
                        sStart < range[1] && range[0] < sEnd
                );

                if (!overlaps) {
                    allSlots.add(slotStart.toString() + "-" + slotEnd.toString());
                }

                // Move to next possible slot start (step by duration)
                slotStart = slotStart.plusMinutes(durationMinutes);
            }
        }

        // 9. If today, remove past slots (must be at least 1 hour from now)
        if (date.equals(LocalDate.now())) {
            LocalTime minTime = LocalTime.now().plusHours(1);
            allSlots.removeIf(slot -> {
                LocalTime slotStart2 = LocalTime.parse(slot.split("-")[0]);
                return slotStart2.isBefore(minTime);
            });
        }

        return allSlots;
    }

    // Keep backward compatible version (without serviceId)
    public List<String> getAvailableSlots(Long nurseId, LocalDate date) {
        // Default to 60 min slots if no service specified
        if (nurseBlockedDateRepository.existsByNurseNurseIdAndBlockedDate(nurseId, date)) {
            return Collections.emptyList();
        }
        String dayOfWeek = date.getDayOfWeek().name();
        List<NurseSchedule> schedules = nurseScheduleRepository.findByNurseNurseIdAndDayOfWeek(nurseId, dayOfWeek);
        schedules = schedules.stream().filter(s -> Boolean.TRUE.equals(s.getIsActive())).toList();
        List<String> slots = new ArrayList<>();
        for (NurseSchedule schedule : schedules) {
            slots.add(schedule.getStartTime().toString() + "-" + schedule.getEndTime().toString());
        }
        return slots;
    }

    // ─── Create Booking Request with Buffer ──────────────────────────────────────

    public NurseRequest createRequest(String patientEmail, NurseRequestDto dto) {
        User patient = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Nurse nurse = nurseRepository.findById(dto.getNurseId())
                .orElseThrow(() -> new RuntimeException("Nurse not found"));
        NurseService service = nurseServiceRepository.findById(dto.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        // Validate slot availability
        if (dto.getTimeSlot() != null) {
            List<String> available = getAvailableSlots(nurse.getNurseId(), dto.getRequestDate());
            if (!available.contains(dto.getTimeSlot())) {
                throw new RuntimeException("Selected time slot is not available");
            }
        }

        NurseRequest request = new NurseRequest();
        request.setPatient(patient);
        request.setNurse(nurse);
        request.setService(service);
        request.setAddress(dto.getAddress());
        request.setHealthIssue(dto.getHealthIssue());
        request.setRequestDate(dto.getRequestDate());
        request.setPreferredTime(dto.getPreferredTime());
        request.setTimeSlot(dto.getTimeSlot());
        request.setBookingGroupId(dto.getBookingGroupId());

        // Set dynamic buffer expiry time based on urgency
        int bufferMinutes = calculateBufferMinutes(dto.getRequestDate(), dto.getTimeSlot());
        request.setExpiresAt(LocalDateTime.now().plusMinutes(bufferMinutes));

        NurseRequest saved = nurseRequestRepository.save(request);

        // Notify the nurse about new booking request
        int notifyBuffer = calculateBufferMinutes(dto.getRequestDate(), dto.getTimeSlot());
        notificationService.notifyNurse(nurse.getEmail(), "NEW_REQUEST",
                "New Booking Request",
                "You have a new " + service.getServiceName() + " request from " + patient.getUsername()
                        + " for " + dto.getRequestDate()
                        + (dto.getTimeSlot() != null ? " (" + dto.getTimeSlot() + ")" : "")
                        + ". Please respond within " + notifyBuffer + " minutes.");

        return saved;
    }

    // ─── Multi-day booking ───────────────────────────────────────────────────────

    public List<NurseRequest> createMultiDayBooking(String patientEmail, NurseRequestDto dto, List<LocalDate> dates, List<String> timeSlots) {
        String groupId = UUID.randomUUID().toString();
        List<NurseRequest> requests = new ArrayList<>();

        for (int i = 0; i < dates.size(); i++) {
            NurseRequestDto dayDto = new NurseRequestDto();
            dayDto.setNurseId(dto.getNurseId());
            dayDto.setServiceId(dto.getServiceId());
            dayDto.setAddress(dto.getAddress());
            dayDto.setHealthIssue(dto.getHealthIssue());
            dayDto.setRequestDate(dates.get(i));
            dayDto.setPreferredTime(dto.getPreferredTime());
            dayDto.setTimeSlot(timeSlots.size() > i ? timeSlots.get(i) : dto.getTimeSlot());
            dayDto.setBookingGroupId(groupId);

            requests.add(createRequest(patientEmail, dayDto));
        }

        return requests;
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

        // Validate status transition
        String currentStatus = request.getRequestStatus();
        validateStatusTransition(currentStatus, status);

        request.setRequestStatus(status);

        // Set timestamps based on status
        if ("accepted".equals(status)) {
            request.setAcceptedAt(LocalDateTime.now());
        } else if ("completed".equals(status)) {
            request.setCompletedAt(LocalDateTime.now());
        }

        NurseRequest saved = nurseRequestRepository.save(request);

        // Notify the patient about status change
        String patientEmail = request.getPatient().getEmail();
        String nurseName = request.getNurse().getFullName();
        String title = "Nurse Request " + status.substring(0, 1).toUpperCase() + status.substring(1);
        String message = switch (status) {
            case "accepted" -> "Your request has been accepted by " + nurseName + ". They will arrive on " + request.getRequestDate()
                    + (request.getTimeSlot() != null ? " at " + request.getTimeSlot().split("-")[0] : "");
            case "rejected" -> "Your request with " + nurseName + " has been declined. Your payment will be refunded.";
            case "in_progress" -> nurseName + " is on the way for your " + request.getService().getServiceName();
            case "completed" -> "Your " + request.getService().getServiceName() + " with " + nurseName + " is completed. Please leave a review!";
            case "cancelled" -> "Your request with " + nurseName + " has been cancelled. Your payment will be refunded.";
            default -> "Your nurse request status has been updated to: " + status;
        };
        notificationService.notifyUser(patientEmail, "REQUEST_UPDATE", title, message);

        return saved;
    }

    private void validateStatusTransition(String current, String next) {
        Map<String, Set<String>> allowed = Map.of(
                "pending", Set.of("accepted", "rejected", "expired", "cancelled"),
                "accepted", Set.of("in_progress", "completed", "cancelled"),
                "in_progress", Set.of("completed")
        );

        Set<String> allowedNext = allowed.getOrDefault(current, Collections.emptySet());
        if (!allowedNext.contains(next)) {
            throw new RuntimeException("Cannot change status from '" + current + "' to '" + next + "'");
        }
    }

    /**
     * Calculate dynamic buffer time based on booking urgency.
     * - Urgent (same day, slot within 4 hours): 10 minutes
     * - Today (same day, slot 4+ hours away): 20 minutes
     * - Tomorrow+ (future dates): 60 minutes
     */
    private int calculateBufferMinutes(LocalDate requestDate, String timeSlot) {
        LocalDate today = LocalDate.now();

        if (requestDate.equals(today)) {
            // Same day booking
            if (timeSlot != null && timeSlot.contains("-")) {
                LocalTime slotStart = LocalTime.parse(timeSlot.split("-")[0].trim());
                long hoursUntilSlot = java.time.Duration.between(LocalTime.now(), slotStart).toHours();
                if (hoursUntilSlot < 4) {
                    return 10; // Urgent
                }
            }
            return 20; // Today, not urgent
        }

        return 60; // Tomorrow or later
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
