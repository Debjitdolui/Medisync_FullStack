package com.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank private String subject;
    @NotBlank private String description;
    @NotBlank private String category; // ACCOUNT, BOOKING, PAYMENT, TECHNICAL, OTHER
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL (defaults to MEDIUM)
}
