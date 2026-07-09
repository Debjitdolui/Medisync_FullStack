package com.medisync.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class NurseRequestDto {
    private Long nurseId;
    private Long serviceId;
    private String address;
    private String healthIssue;
    private LocalDate requestDate;
    private String preferredTime;
    private String timeSlot;        // e.g., "10:00-11:00"
    private String bookingGroupId;  // for multi-day bookings
    private String paymentMethod;   // "wallet", "upi", "card"

    // Multi-day booking fields
    private List<LocalDate> dates;
    private List<String> timeSlots;
}
