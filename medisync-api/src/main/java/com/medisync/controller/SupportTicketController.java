package com.medisync.controller;

import com.medisync.dto.*;
import com.medisync.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support/tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@RequestBody CreateTicketRequest req,
                                                       Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(supportTicketService.createTicket(req, auth.getName(), role));
    }

    @GetMapping
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getAllTickets(status, category, priority, pageable));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(Authentication auth, Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getTicketsByRaiser(auth.getName(), pageable));
    }

    @GetMapping("/assigned")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(Authentication auth, Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getTicketsByAgent(auth.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketDetailResponse> getTicketById(@PathVariable Long id,
                                                              Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(supportTicketService.getTicketById(id, auth.getName(), role));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<TicketDetailResponse.MessageDto> addMessage(@PathVariable Long id,
                                                                      @RequestBody TicketMessageRequest req,
                                                                      Authentication auth) {
        String role = extractRole(auth);
        return ResponseEntity.ok(supportTicketService.addMessage(id, req, auth.getName(), role));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id,
                                                       Authentication auth) {
        return ResponseEntity.ok(supportTicketService.assignTicket(id, auth.getName()));
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<TicketResponse> escalateTicket(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body,
                                                         Authentication auth) {
        String reason = body.get("reason");
        return ResponseEntity.ok(supportTicketService.escalateTicket(id, reason, auth.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(supportTicketService.updateStatus(id, status));
    }

    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5).toLowerCase())
                .findFirst()
                .orElse("customer");
    }
}
