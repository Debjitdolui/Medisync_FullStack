package com.medisync.service;

import com.medisync.entity.NurseRequest;
import com.medisync.repository.NurseRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled task that auto-expires pending nurse requests
 * when the 30-minute buffer time has passed without nurse response.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingExpiryScheduler {

    private final NurseRequestRepository nurseRequestRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 2 minutes to check for expired pending requests.
     */
    @Scheduled(fixedRate = 120000) // every 2 minutes
    public void expirePendingRequests() {
        LocalDateTime now = LocalDateTime.now();
        List<NurseRequest> expiredRequests = nurseRequestRepository.findExpiredPendingRequests(now);

        if (expiredRequests.isEmpty()) return;

        log.info("Found {} expired pending requests to process", expiredRequests.size());

        for (NurseRequest request : expiredRequests) {
            try {
                // Mark as expired
                request.setRequestStatus("expired");
                nurseRequestRepository.save(request);

                // Notify user
                String patientEmail = request.getPatient().getEmail();
                String nurseName = request.getNurse().getFullName();
                notificationService.notifyUser(patientEmail, "REQUEST_UPDATE",
                        "Booking Request Expired",
                        "Your booking request with " + nurseName + " for " + request.getRequestDate()
                                + " has expired as the nurse did not respond within the time limit. "
                                + "Please book another nurse.");

                // Notify nurse that they missed it
                notificationService.notifyNurse(request.getNurse().getEmail(), "REQUEST_EXPIRED",
                        "Missed Booking Request",
                        "You did not respond to the booking request from " + request.getPatient().getUsername()
                                + " for " + request.getRequestDate() + " within the time limit. The request has expired.");

                log.info("Expired request #{} for nurse {}", request.getRequestId(), nurseName);
            } catch (Exception e) {
                log.error("Error expiring request #{}: {}", request.getRequestId(), e.getMessage());
            }
        }
    }
}
