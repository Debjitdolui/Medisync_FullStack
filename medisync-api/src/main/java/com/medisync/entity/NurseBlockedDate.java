package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nurse_blocked_dates", schema = "dev")
public class NurseBlockedDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "blocked_id")
    private Long blockedId;

    @ManyToOne
    @JoinColumn(name = "nurse_id", referencedColumnName = "nurse_id")
    private Nurse nurse;

    @Column(name = "blocked_date")
    private LocalDate blockedDate;

    @Column(name = "reason")
    private String reason;
}
