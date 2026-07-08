package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "master_medicines", schema = "dev")
public class MasterMedicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "master_medicine_id")
    private Long masterMedicineId;

    @Column(name = "medicine_name", unique = true, nullable = false)
    private String medicineName;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private MedicineCategory category;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
