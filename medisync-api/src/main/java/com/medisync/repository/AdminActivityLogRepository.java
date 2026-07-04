package com.medisync.repository;

import com.medisync.entity.AdminActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findAllByOrderByCreatedAtDesc();
}
