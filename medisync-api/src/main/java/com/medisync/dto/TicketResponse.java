package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private Long ticketId;
    private Long raisedByUserId;
    private String raisedByUsername;
    private String raisedByRole;
    private String category;
    private String priority;
    private String status;
    private String subject;
    private String description;
    private Long assignedToUserId;
    private String assignedToUsername;
    private String escalationReason;
    private long messagesCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
