package com.medisync.repository;

import com.medisync.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    Page<SupportTicket> findByRaisedByUserUserId(Long userId, Pageable pageable);

    Page<SupportTicket> findByAssignedToUserId(Long userId, Pageable pageable);

    Page<SupportTicket> findByStatus(String status, Pageable pageable);

    List<SupportTicket> findByStatus(String status);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:priority IS NULL OR t.priority = :priority)")
    Page<SupportTicket> findWithFilters(@Param("status") String status,
                                        @Param("category") String category,
                                        @Param("priority") String priority,
                                        Pageable pageable);
}
