package com.medisync.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nurse_reviews", schema = "dev", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "nurse_id", "request_id"})
})
public class NurseReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "nurse_id", referencedColumnName = "nurse_id")
    private Nurse nurse;

    @ManyToOne
    @JoinColumn(name = "request_id", referencedColumnName = "request_id")
    private NurseRequest request;

    @Column(name = "rating")
    private int rating;

    @Column(name = "review_text")
    private String reviewText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
