package com.medisync.repository;

import com.medisync.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {

    List<TicketMessage> findByTicketTicketIdOrderByCreatedAtAsc(Long ticketId);

    List<TicketMessage> findByTicketTicketIdAndIsInternalFalseOrderByCreatedAtAsc(Long ticketId);

    long countByTicketTicketId(Long ticketId);
}
