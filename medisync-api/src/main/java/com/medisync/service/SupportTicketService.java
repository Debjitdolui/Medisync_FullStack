package com.medisync.service;

import com.medisync.dto.*;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NurseRepository nurseRepository;
    private final PharmacyRepository pharmacyRepository;

    public TicketResponse createTicket(CreateTicketRequest req, String email, String role) {
        User user = findOrCreateUserForTicket(email, role);

        SupportTicket ticket = new SupportTicket();
        ticket.setRaisedByUser(user);
        ticket.setRaisedByRole(role.toUpperCase());
        ticket.setCategory(req.getCategory().toUpperCase());
        ticket.setPriority(req.getPriority() != null ? req.getPriority().toUpperCase() : "MEDIUM");
        ticket.setStatus("OPEN");
        ticket.setSubject(req.getSubject());
        ticket.setDescription(req.getDescription());

        ticketRepository.save(ticket);
        return toTicketResponse(ticket, 0);
    }

    public Page<TicketResponse> getTicketsByRaiser(String email, Pageable pageable) {
        User user = findOrCreateUserForTicket(email, null);

        return ticketRepository.findByRaisedByUserUserId(user.getUserId(), pageable)
                .map(t -> toTicketResponse(t, messageRepository.countByTicketTicketId(t.getTicketId())));
    }

    public Page<TicketResponse> getAllTickets(String status, String category, String priority, Pageable pageable) {
        return ticketRepository.findWithFilters(status, category, priority, pageable)
                .map(t -> toTicketResponse(t, messageRepository.countByTicketTicketId(t.getTicketId())));
    }

    public TicketDetailResponse getTicketById(Long ticketId, String email, String role) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Determine which messages to show
        List<TicketMessage> messages;
        if ("support_agent".equalsIgnoreCase(role) || "admin".equalsIgnoreCase(role)) {
            messages = messageRepository.findByTicketTicketIdOrderByCreatedAtAsc(ticketId);
        } else {
            // Non-agents only see non-internal messages
            messages = messageRepository.findByTicketTicketIdAndIsInternalFalseOrderByCreatedAtAsc(ticketId);
        }

        return toTicketDetailResponse(ticket, messages);
    }

    public TicketDetailResponse.MessageDto addMessage(Long ticketId, TicketMessageRequest req, String email, String role) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User sender = findOrCreateUserForTicket(email, role);

        TicketMessage message = new TicketMessage();
        message.setTicket(ticket);
        message.setSender(sender);
        message.setSenderRole(role.toUpperCase());
        message.setMessage(req.getMessage());
        message.setIsInternal(Boolean.TRUE.equals(req.getIsInternal()));

        messageRepository.save(message);

        TicketDetailResponse.MessageDto dto = new TicketDetailResponse.MessageDto();
        dto.setMessageId(message.getMessageId());
        dto.setSenderUserId(sender.getUserId());
        dto.setSenderUsername(sender.getUsername());
        dto.setSenderRole(message.getSenderRole());
        dto.setMessage(message.getMessage());
        dto.setIsInternal(message.getIsInternal());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }

    public TicketResponse assignTicket(Long ticketId, String agentEmail) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        ticket.setAssignedTo(agent);
        ticket.setStatus("ASSIGNED");
        ticketRepository.save(ticket);

        return toTicketResponse(ticket, messageRepository.countByTicketTicketId(ticketId));
    }

    public TicketResponse escalateTicket(Long ticketId, String reason, String agentEmail) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus("ESCALATED");
        ticket.setEscalationReason(reason);
        ticketRepository.save(ticket);

        return toTicketResponse(ticket, messageRepository.countByTicketTicketId(ticketId));
    }

    public TicketResponse updateStatus(Long ticketId, String status) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status.toUpperCase());
        ticketRepository.save(ticket);

        return toTicketResponse(ticket, messageRepository.countByTicketTicketId(ticketId));
    }

    public Page<TicketResponse> getTicketsByAgent(String agentEmail, Pageable pageable) {
        User agent = userRepository.findByEmail(agentEmail)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        return ticketRepository.findByAssignedToUserId(agent.getUserId(), pageable)
                .map(t -> toTicketResponse(t, messageRepository.countByTicketTicketId(t.getTicketId())));
    }

    public Page<TicketResponse> getEscalatedTickets(Pageable pageable) {
        return ticketRepository.findByStatus("ESCALATED", pageable)
                .map(t -> toTicketResponse(t, messageRepository.countByTicketTicketId(t.getTicketId())));
    }

    // ─── User Resolution Helper ──────────────────────────────────────────────────
    // Nurses and Pharmacies are in separate tables. This method finds or creates
    // a User record so they can be linked to tickets.
    private User findOrCreateUserForTicket(String email, String role) {
        // First check users table
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) return userOpt.get();

        // Check nurses table and create a shadow user
        var nurseOpt = nurseRepository.findByEmail(email);
        if (nurseOpt.isPresent()) {
            var nurse = nurseOpt.get();
            User user = new User();
            user.setUsername("nurse_" + email);
            user.setEmail(nurse.getEmail());
            user.setPasswordHash(nurse.getPasswordHash());
            user.setPhone(nurse.getPhone());
            user.setRole("nurse");
            user.setStatus("active");
            user.setIsActive(true);
            return userRepository.save(user);
        }

        // Check pharmacies table and create a shadow user
        var pharmacyOpt = pharmacyRepository.findByEmail(email);
        if (pharmacyOpt.isPresent()) {
            var pharmacy = pharmacyOpt.get();
            User user = new User();
            user.setUsername("pharmacy_" + email);
            user.setEmail(pharmacy.getEmail());
            user.setPasswordHash(pharmacy.getPasswordHash());
            user.setPhone(pharmacy.getPhone());
            user.setRole("pharmacy");
            user.setStatus("active");
            user.setIsActive(true);
            return userRepository.save(user);
        }

        throw new RuntimeException("User not found with email: " + email);
    }

    // ─── Mapping Helpers ─────────────────────────────────────────────────────────

    private TicketResponse toTicketResponse(SupportTicket ticket, long messagesCount) {
        TicketResponse res = new TicketResponse();
        res.setTicketId(ticket.getTicketId());
        res.setRaisedByUserId(ticket.getRaisedByUser().getUserId());
        res.setRaisedByUsername(getDisplayName(ticket.getRaisedByUser(), ticket.getRaisedByRole()));
        res.setRaisedByRole(ticket.getRaisedByRole());
        res.setCategory(ticket.getCategory());
        res.setPriority(ticket.getPriority());
        res.setStatus(ticket.getStatus());
        res.setSubject(ticket.getSubject());
        res.setDescription(ticket.getDescription());
        res.setAssignedToUserId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUserId() : null);
        res.setAssignedToUsername(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUsername() : null);
        res.setEscalationReason(ticket.getEscalationReason());
        res.setMessagesCount(messagesCount);
        res.setCreatedAt(ticket.getCreatedAt());
        res.setUpdatedAt(ticket.getUpdatedAt());
        return res;
    }

    private String getDisplayName(User user, String raisedByRole) {
        if ("NURSE".equalsIgnoreCase(raisedByRole)) {
            var nurse = nurseRepository.findByEmail(user.getEmail());
            if (nurse.isPresent()) return nurse.get().getFullName();
        } else if ("PHARMACY".equalsIgnoreCase(raisedByRole)) {
            var pharmacy = pharmacyRepository.findByEmail(user.getEmail());
            if (pharmacy.isPresent()) return pharmacy.get().getOwnerName();
        }
        return user.getUsername();
    }

    private TicketDetailResponse toTicketDetailResponse(SupportTicket ticket, List<TicketMessage> messages) {
        TicketDetailResponse res = new TicketDetailResponse();
        res.setTicketId(ticket.getTicketId());
        res.setRaisedByUserId(ticket.getRaisedByUser().getUserId());
        res.setRaisedByUsername(getDisplayName(ticket.getRaisedByUser(), ticket.getRaisedByRole()));
        res.setRaisedByRole(ticket.getRaisedByRole());
        res.setCategory(ticket.getCategory());
        res.setPriority(ticket.getPriority());
        res.setStatus(ticket.getStatus());
        res.setSubject(ticket.getSubject());
        res.setDescription(ticket.getDescription());
        res.setAssignedToUserId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUserId() : null);
        res.setAssignedToUsername(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getUsername() : null);
        res.setEscalationReason(ticket.getEscalationReason());
        res.setCreatedAt(ticket.getCreatedAt());
        res.setUpdatedAt(ticket.getUpdatedAt());

        List<TicketDetailResponse.MessageDto> messageDtos = messages.stream().map(m -> {
            TicketDetailResponse.MessageDto dto = new TicketDetailResponse.MessageDto();
            dto.setMessageId(m.getMessageId());
            dto.setSenderUserId(m.getSender().getUserId());
            dto.setSenderUsername(m.getSender().getUsername());
            dto.setSenderRole(m.getSenderRole());
            dto.setMessage(m.getMessage());
            dto.setIsInternal(m.getIsInternal());
            dto.setCreatedAt(m.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());

        res.setMessages(messageDtos);
        return res;
    }
}
