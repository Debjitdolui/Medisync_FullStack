package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailResponse {
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MessageDto> messages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private Long messageId;
        private Long senderUserId;
        private String senderUsername;
        private String senderRole;
        private String message;
        private Boolean isInternal;
        private LocalDateTime createdAt;
    }
}
