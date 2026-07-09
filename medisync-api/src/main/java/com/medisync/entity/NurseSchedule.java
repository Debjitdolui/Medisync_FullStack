package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nurse_schedules", schema = "dev")
public class NurseSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne
    @JoinColumn(name = "nurse_id", referencedColumnName = "nurse_id")
    private Nurse nurse;

    @Column(name = "day_of_week")
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
