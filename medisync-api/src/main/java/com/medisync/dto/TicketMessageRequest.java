package com.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketMessageRequest {
    @NotBlank private String message;
    private Boolean isInternal = false;
}
