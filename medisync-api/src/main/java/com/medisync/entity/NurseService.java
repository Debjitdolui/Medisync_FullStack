package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nurse_services", schema = "dev")
public class NurseService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "service_name", unique = true)
    private String serviceName;

    @Column(name = "description")
    private String description;

    @Column(name = "base_price")
    private BigDecimal basePrice;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // 30 for Injection, 240 for IV Drip, 480 for Home Nursing
}
