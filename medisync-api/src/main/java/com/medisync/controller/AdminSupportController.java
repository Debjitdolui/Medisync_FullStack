package com.medisync.controller;

import com.medisync.dto.TicketResponse;
import com.medisync.entity.User;
import com.medisync.repository.UserRepository;
import com.medisync.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSupportController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SupportTicketService supportTicketService;

    @PostMapping("/support-agents")
    public ResponseEntity<?> createSupportAgent(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String fullName = body.get("fullName");
        String password = body.get("password");
        String phone = body.get("phone");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already registered"));
        }

        User agent = new User();
        agent.setUsername(fullName);
        agent.setEmail(email);
        agent.setPasswordHash(passwordEncoder.encode(password));
        agent.setPhone(phone);
        agent.setRole("support_agent");
        agent.setStatus("active");
        agent.setIsActive(true);
        userRepository.save(agent);

        return ResponseEntity.ok(Map.of(
                "userId", agent.getUserId(),
                "username", agent.getUsername(),
                "email", agent.getEmail(),
                "phone", agent.getPhone(),
                "role", agent.getRole(),
                "status", agent.getStatus()
        ));
    }

    @GetMapping("/support-agents")
    public ResponseEntity<List<User>> getAllSupportAgents() {
        List<User> agents = userRepository.findByRole("support_agent");
        return ResponseEntity.ok(agents);
    }

    @PutMapping("/support-agents/{id}/block")
    public ResponseEntity<?> blockSupportAgent(@PathVariable Long id, Authentication auth) {
        User agent = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Support agent not found"));

        if (!"support_agent".equals(agent.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is not a support agent"));
        }

        agent.setStatus("blocked");
        agent.setIsActive(false);
        userRepository.save(agent);
        return ResponseEntity.ok(Map.of("message", "Support agent blocked", "userId", agent.getUserId()));
    }

    @PutMapping("/support-agents/{id}/unblock")
    public ResponseEntity<?> unblockSupportAgent(@PathVariable Long id, Authentication auth) {
        User agent = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Support agent not found"));

        if (!"support_agent".equals(agent.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("error", "User is not a support agent"));
        }

        agent.setStatus("active");
        agent.setIsActive(true);
        userRepository.save(agent);
        return ResponseEntity.ok(Map.of("message", "Support agent unblocked", "userId", agent.getUserId()));
    }

    @GetMapping("/escalated-tickets")
    public ResponseEntity<Page<TicketResponse>> getEscalatedTickets(Pageable pageable) {
        return ResponseEntity.ok(supportTicketService.getEscalatedTickets(pageable));
    }
}
