package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nurse_requests", schema = "dev")
public class NurseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "patient_id", referencedColumnName = "user_id")
    private User patient;

    @ManyToOne
    @JoinColumn(name = "nurse_id", referencedColumnName = "nurse_id")
    private Nurse nurse;

    @ManyToOne
    @JoinColumn(name = "service_id", referencedColumnName = "service_id")
    private NurseService service;

    @Column(name = "address")
    private String address;

    @Column(name = "health_issue", columnDefinition = "TEXT")
    private String healthIssue;

    @Column(name = "request_date")
    private LocalDate requestDate;

    @Column(name = "preferred_time")
    private String preferredTime;

    @Column(name = "request_status", columnDefinition = "varchar(255) default 'pending'")
    private String requestStatus = "pending";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
