package com.medisync.repository;

import com.medisync.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findTopByEmailAndIsUsedFalseOrderByCreatedAtDesc(String email);
}
