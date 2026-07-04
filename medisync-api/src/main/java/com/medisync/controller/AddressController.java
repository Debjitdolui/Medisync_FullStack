package com.medisync.controller;

import com.medisync.dto.AddressRequest;
import com.medisync.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        return ResponseEntity.ok(userService.getAddresses(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<?> add(Authentication auth, @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(userService.addAddress(auth.getName(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(Authentication auth, @PathVariable Long id, @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(userService.updateAddress(auth.getName(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(Authentication auth, @PathVariable Long id) {
        userService.deleteAddress(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
