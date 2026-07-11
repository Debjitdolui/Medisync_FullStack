package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "support_tickets", schema = "dev")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id")
    private Long ticketId;

    @ManyToOne
    @JoinColumn(name = "raised_by_user_id")
    private User raisedByUser;

    @Column(name = "raised_by_role")
    private String raisedByRole; // USER, PHARMACY, NURSE

    @Column(name = "category")
    private String category; // ACCOUNT, BOOKING, PAYMENT, TECHNICAL, OTHER

    @Column(name = "priority")
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "status")
    private String status; // OPEN, ASSIGNED, IN_PROGRESS, ESCALATED, RESOLVED, CLOSED

    @Column(name = "subject")
    private String subject;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column(name = "escalation_reason")
    private String escalationReason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
