package com.medisync.controller;

import com.medisync.dto.NurseReviewRequest;
import com.medisync.dto.PharmacyReviewRequest;
import com.medisync.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/pharmacy")
    public ResponseEntity<?> addPharmacyReview(Authentication auth, @Valid @RequestBody PharmacyReviewRequest req) {
        return ResponseEntity.ok(reviewService.addPharmacyReview(auth.getName(), req));
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<?> getPharmacyReviews(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(reviewService.getPharmacyReviews(pharmacyId));
    }

    @PostMapping("/nurse")
    public ResponseEntity<?> addNurseReview(Authentication auth, @Valid @RequestBody NurseReviewRequest req) {
        return ResponseEntity.ok(reviewService.addNurseReview(auth.getName(), req));
    }

    @GetMapping("/nurse/{nurseId}")
    public ResponseEntity<?> getNurseReviews(@PathVariable Long nurseId) {
        return ResponseEntity.ok(reviewService.getNurseReviews(nurseId));
    }
}
