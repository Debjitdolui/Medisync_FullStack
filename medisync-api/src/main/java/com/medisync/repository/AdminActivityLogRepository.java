package com.medisync.repository;

import com.medisync.entity.AdminActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdminActivityLogRepository extends JpaRepository<AdminActivityLog, Long> {
    List<AdminActivityLog> findAllByOrderByCreatedAtDesc();
    Page<AdminActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
