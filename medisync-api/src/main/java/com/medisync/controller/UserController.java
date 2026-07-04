package com.medisync.controller;

import com.medisync.dto.UpdateProfileRequest;
import com.medisync.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), req));
    }

    @PostMapping("/deactivate")
    public ResponseEntity<?> deactivate(Authentication auth) {
        userService.deactivate(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Account deactivated"));
    }

    @PostMapping("/reactivate")
    public ResponseEntity<?> reactivate(@RequestBody Map<String, String> body) {
        userService.reactivate(body.get("email"), body.get("password"));
        return ResponseEntity.ok(Map.of("message", "Account reactivated"));
    }
}
