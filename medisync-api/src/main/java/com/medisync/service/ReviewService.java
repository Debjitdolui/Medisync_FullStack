package com.medisync.service;

import com.medisync.dto.NurseReviewRequest;
import com.medisync.dto.PharmacyReviewRequest;
import com.medisync.entity.*;
import com.medisync.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final PharmacyReviewRepository pharmacyReviewRepository;
    private final NurseReviewRepository nurseReviewRepository;
    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final NurseRepository nurseRepository;
    private final NurseRequestRepository nurseRequestRepository;
    private final NotificationService notificationService;

    public PharmacyReview addPharmacyReview(String userEmail, PharmacyReviewRequest req) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Pharmacy pharmacy = pharmacyRepository.findById(req.getPharmacyId()).orElseThrow(() -> new RuntimeException("Pharmacy not found"));
        PharmacyReview review = new PharmacyReview();
        review.setUser(user);
        review.setPharmacy(pharmacy);
        review.setRating(req.getRating());
        review.setReviewText(req.getReviewText());
        PharmacyReview saved = pharmacyReviewRepository.save(review);

        // Notify pharmacy about new review
        notificationService.notifyPharmacy(pharmacy.getEmail(), "NEW_REVIEW",
                "New Review Received (" + req.getRating() + "★)",
                user.getUsername() + " left a " + req.getRating() + "-star review for " + pharmacy.getPharmacyName());

        return saved;
    }

    public List<PharmacyReview> getPharmacyReviews(Long pharmacyId) {
        return pharmacyReviewRepository.findByPharmacyPharmacyId(pharmacyId);
    }

    public Page<PharmacyReview> getPharmacyReviews(Long pharmacyId, Pageable pageable) {
        return pharmacyReviewRepository.findByPharmacyPharmacyId(pharmacyId, pageable);
    }

    public NurseReview addNurseReview(String userEmail, NurseReviewRequest req) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        Nurse nurse = nurseRepository.findById(req.getNurseId()).orElseThrow(() -> new RuntimeException("Nurse not found"));
        NurseRequest request = nurseRequestRepository.findById(req.getRequestId()).orElseThrow(() -> new RuntimeException("Request not found"));
        NurseReview review = new NurseReview();
        review.setUser(user);
        review.setNurse(nurse);
        review.setRequest(request);
        review.setRating(req.getRating());
        review.setReviewText(req.getReviewText());
        NurseReview saved = nurseReviewRepository.save(review);

        // Notify nurse about new review
        notificationService.notifyNurse(nurse.getEmail(), "NEW_REVIEW",
                "New Review Received (" + req.getRating() + "★)",
                user.getUsername() + " left a " + req.getRating() + "-star review for your service.");

        return saved;
    }

    public List<NurseReview> getNurseReviews(Long nurseId) {
        return nurseReviewRepository.findByNurseNurseId(nurseId);
    }

    public Page<NurseReview> getNurseReviews(Long nurseId, Pageable pageable) {
        return nurseReviewRepository.findByNurseNurseId(nurseId, pageable);
    }
}
