package com.medisync.controller;

import com.medisync.dto.NurseRequestDto;
import com.medisync.entity.NurseRequest;
import com.medisync.entity.NurseService;
import com.medisync.entity.Payment;
import com.medisync.entity.User;
import com.medisync.repository.NurseRequestRepository;
import com.medisync.repository.NurseServiceRepository;
import com.medisync.repository.UserRepository;
import com.medisync.service.NurseModuleService;
import com.medisync.service.PaymentService;
import com.medisync.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse-requests")
@RequiredArgsConstructor
public class NurseRequestController {

    private final NurseModuleService nurseModuleService;
    private final PaymentService paymentService;
    private final RazorpayService razorpayService;
    private final UserRepository userRepository;
    private final NurseServiceRepository nurseServiceRepository;
    private final NurseRequestRepository nurseRequestRepository;

    // ─── Create booking (NO payment at this stage) ───────────────────────────────

    @PostMapping
    public ResponseEntity<?> createRequest(Authentication auth, @RequestBody NurseRequestDto dto) {
        NurseRequest request = nurseModuleService.createRequest(auth.getName(), dto);
        return ResponseEntity.ok(request);
    }

    // ─── Create multi-day booking (NO payment) ───────────────────────────────────

    @PostMapping("/multi-day")
    public ResponseEntity<?> createMultiDayBooking(Authentication auth, @RequestBody NurseRequestDto dto) {
        if (dto.getDates() == null || dto.getDates().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Dates list is required for multi-day booking"));
        }

        List<String> timeSlots = dto.getTimeSlots() != null ? dto.getTimeSlots() :
                dto.getDates().stream().map(d -> dto.getTimeSlot()).toList();

        List<NurseRequest> requests = nurseModuleService.createMultiDayBooking(
                auth.getName(), dto, dto.getDates(), timeSlots);

        return ResponseEntity.ok(Map.of(
                "bookingGroupId", requests.get(0).getBookingGroupId(),
                "totalDays", requests.size(),
                "requests", requests
        ));
    }

    // ─── Get available slots for a nurse on a date ───────────────────────────────

    @GetMapping("/slots")
    public ResponseEntity<?> getAvailableSlots(@RequestParam Long nurseId, @RequestParam String date, @RequestParam(required = false) Long serviceId) {
        LocalDate requestDate = LocalDate.parse(date);
        List<String> slots;
        if (serviceId != null) {
            slots = nurseModuleService.getAvailableSlots(nurseId, requestDate, serviceId);
        } else {
            slots = nurseModuleService.getAvailableSlots(nurseId, requestDate);
        }
        return ResponseEntity.ok(Map.of("nurseId", nurseId, "date", date, "availableSlots", slots));
    }

    // ─── Get my requests (patient) ───────────────────────────────────────────────

    @GetMapping("/my")
    public ResponseEntity<?> getPatientRequests(Authentication auth) {
        return ResponseEntity.ok(nurseModuleService.getPatientRequests(auth.getName()));
    }

    // ─── Get requests for nurse ──────────────────────────────────────────────────

    @GetMapping("/nurse")
    public ResponseEntity<?> getNurseRequests(Authentication auth) {
        return ResponseEntity.ok(nurseModuleService.getNurseRequests(auth.getName()));
    }

    // ─── Update request status (nurse accepts/rejects, or marks in_progress/completed)

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id, @RequestParam String status) {
        NurseRequest request = nurseModuleService.updateRequestStatus(id, status);
        return ResponseEntity.ok(request);
    }

    // ─── Cancel request (by patient, before nurse accepts) ───────────────────────

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(Authentication auth, @PathVariable Long id) {
        NurseRequest request = nurseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!"pending".equals(request.getRequestStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Can only cancel pending requests"));
        }

        NurseRequest updated = nurseModuleService.updateRequestStatus(id, "cancelled");
        return ResponseEntity.ok(updated);
    }

    // ─── Payment: Create Razorpay order (after nurse accepts) ────────────────────

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> createPaymentOrder(Authentication auth, @PathVariable Long id) {
        NurseRequest request = nurseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Only allow payment for accepted requests
        if (!"accepted".equals(request.getRequestStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment is only available for accepted requests"));
        }

        // Check if already paid
        if (paymentService.getPaymentByRequest(id).isPresent()) {
            Payment existing = paymentService.getPaymentByRequest(id).get();
            if ("paid".equals(existing.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Already paid"));
            }
        }

        try {
            Map<String, Object> order = razorpayService.createOrder(
                    request.getService().getBasePrice().longValue() * 100, // amount in paise
                    "INR",
                    "request_" + request.getRequestId()
            );

            return ResponseEntity.ok(Map.of(
                    "orderId", order.get("id"),
                    "amount", order.get("amount"),
                    "currency", order.get("currency"),
                    "keyId", razorpayService.getKeyId(),
                    "requestId", request.getRequestId(),
                    "nurseName", request.getNurse().getFullName(),
                    "serviceName", request.getService().getServiceName(),
                    "dummyMode", razorpayService.isDummyMode()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to create payment order: " + e.getMessage()));
        }
    }

    // ─── Payment: Verify Razorpay payment and save ───────────────────────────────

    @PostMapping("/{id}/pay/verify")
    public ResponseEntity<?> verifyPayment(Authentication auth, @PathVariable Long id, @RequestBody Map<String, String> body) {
        NurseRequest request = nurseRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        String razorpayOrderId = body.get("razorpay_order_id");
        String razorpayPaymentId = body.get("razorpay_payment_id");
        String razorpaySignature = body.get("razorpay_signature");

        // Verify signature
        boolean valid = razorpayService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("error", "Payment verification failed"));
        }

        // Save payment record
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Payment payment = paymentService.createPayment(
                request, user,
                request.getService().getBasePrice(),
                "razorpay",
                razorpayPaymentId
        );

        return ResponseEntity.ok(Map.of(
                "message", "Payment successful",
                "payment", payment
        ));
    }

    // ─── Get payment status for a request ────────────────────────────────────────

    @GetMapping("/{id}/payment")
    public ResponseEntity<?> getPaymentStatus(@PathVariable Long id) {
        return paymentService.getPaymentByRequest(id)
                .map(p -> ResponseEntity.ok(Map.of("paid", true, "payment", p)))
                .orElse(ResponseEntity.ok(Map.of("paid", false)));
    }

    // ─── Get booking group details ───────────────────────────────────────────────

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getBookingGroup(@PathVariable String groupId) {
        List<NurseRequest> requests = nurseRequestRepository.findByBookingGroupId(groupId);
        return ResponseEntity.ok(requests);
    }

    // ─── Nurse Calendar: Get bookings for a month ────────────────────────────────

    @GetMapping("/calendar")
    public ResponseEntity<?> getNurseCalendar(Authentication auth, @RequestParam int month, @RequestParam int year) {
        List<NurseRequest> allRequests = nurseModuleService.getNurseRequests(auth.getName());

        // Filter by month/year
        List<Map<String, Object>> calendarData = allRequests.stream()
                .filter(r -> {
                    LocalDate date = r.getRequestDate();
                    return date != null && date.getMonthValue() == month && date.getYear() == year;
                })
                .map(r -> {
                    Map<String, Object> item = new java.util.LinkedHashMap<>();
                    item.put("requestId", r.getRequestId());
                    item.put("date", r.getRequestDate().toString());
                    item.put("timeSlot", r.getTimeSlot());
                    item.put("serviceName", r.getService() != null ? r.getService().getServiceName() : "Unknown");
                    item.put("durationMinutes", r.getService() != null && r.getService().getDurationMinutes() != null ? r.getService().getDurationMinutes() : 60);
                    item.put("patientName", r.getPatient() != null ? r.getPatient().getUsername() : "Unknown");
                    item.put("status", r.getRequestStatus());
                    return item;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(calendarData);
    }

    // ─── Nurse Day Summary: Get detail for a specific date ───────────────────────

    @GetMapping("/day-summary")
    public ResponseEntity<?> getDaySummary(Authentication auth, @RequestParam String date) {
        List<NurseRequest> allRequests = nurseModuleService.getNurseRequests(auth.getName());
        LocalDate targetDate = LocalDate.parse(date);

        List<NurseRequest> dayRequests = allRequests.stream()
                .filter(r -> targetDate.equals(r.getRequestDate()))
                .collect(java.util.stream.Collectors.toList());

        // Calculate total work minutes from actual time slots or service duration
        int totalMinutes = dayRequests.stream()
                .filter(r -> List.of("pending", "accepted", "in_progress", "completed").contains(r.getRequestStatus()))
                .mapToInt(r -> {
                    // Try to calculate from timeSlot first (e.g., "09:30-10:00")
                    if (r.getTimeSlot() != null && r.getTimeSlot().contains("-")) {
                        try {
                            String[] parts = r.getTimeSlot().split("-");
                            java.time.LocalTime start = java.time.LocalTime.parse(parts[0].trim());
                            java.time.LocalTime end = java.time.LocalTime.parse(parts[1].trim());
                            return (int) java.time.Duration.between(start, end).toMinutes();
                        } catch (Exception ignored) {}
                    }
                    // Fallback to service duration
                    return r.getService() != null && r.getService().getDurationMinutes() != null 
                            ? r.getService().getDurationMinutes() : 60;
                })
                .sum();

        return ResponseEntity.ok(Map.of(
                "date", date,
                "bookings", dayRequests,
                "totalWorkMinutes", totalMinutes,
                "maxDailyMinutes", 480,
                "remainingMinutes", Math.max(0, 480 - totalMinutes),
                "capacityPercent", Math.min(100, (totalMinutes * 100) / 480)
        ));
    }
}
