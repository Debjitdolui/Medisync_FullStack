package com.medisync.repository;

import com.medisync.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRequestRequestId(Long requestId);
    List<Payment> findByUserUserId(Long userId);
    List<Payment> findByStatus(String status);
}
