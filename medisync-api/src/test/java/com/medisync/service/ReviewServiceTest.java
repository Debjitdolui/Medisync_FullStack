package com.medisync.service;

import com.medisync.dto.NurseReviewRequest;
import com.medisync.dto.PharmacyReviewRequest;
import com.medisync.entity.*;
import com.medisync.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private PharmacyReviewRepository pharmacyReviewRepository;
    @Mock private NurseReviewRepository nurseReviewRepository;
    @Mock private UserRepository userRepository;
    @Mock private PharmacyRepository pharmacyRepository;
    @Mock private NurseRepository nurseRepository;
    @Mock private NurseRequestRepository nurseRequestRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private ReviewService reviewService;

    @Test
    void testAddPharmacyReview() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");

        Pharmacy pharmacy = new Pharmacy();
        pharmacy.setPharmacyId(1L);
        pharmacy.setPharmacyName("MediStore");
        pharmacy.setEmail("pharmacy@mail.com");

        PharmacyReviewRequest req = new PharmacyReviewRequest();
        req.setPharmacyId(1L);
        req.setRating(5);
        req.setReviewText("Excellent service");

        PharmacyReview review = new PharmacyReview();
        review.setReviewId(1L);
        review.setUser(user);
        review.setPharmacy(pharmacy);
        review.setRating(5);
        review.setReviewText("Excellent service");

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(pharmacyRepository.findById(1L)).thenReturn(Optional.of(pharmacy));
        when(pharmacyReviewRepository.save(any(PharmacyReview.class))).thenReturn(review);

        PharmacyReview result = reviewService.addPharmacyReview("user@mail.com", req);

        assertEquals(5, result.getRating());
        verify(pharmacyReviewRepository).save(any(PharmacyReview.class));
        verify(notificationService).notifyPharmacy(eq("pharmacy@mail.com"), anyString(), anyString(), anyString());
    }

    @Test
    void testAddNurseReview() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("testuser");

        Nurse nurse = new Nurse();
        nurse.setNurseId(1L);
        nurse.setEmail("nurse@mail.com");

        NurseRequest request = new NurseRequest();
        request.setRequestId(1L);

        NurseReviewRequest req = new NurseReviewRequest();
        req.setNurseId(1L);
        req.setRequestId(1L);
        req.setRating(4);
        req.setReviewText("Good care");

        NurseReview review = new NurseReview();
        review.setReviewId(1L);
        review.setUser(user);
        review.setNurse(nurse);
        review.setRequest(request);
        review.setRating(4);
        review.setReviewText("Good care");

        when(userRepository.findByEmail("user@mail.com")).thenReturn(Optional.of(user));
        when(nurseRepository.findById(1L)).thenReturn(Optional.of(nurse));
        when(nurseRequestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(nurseReviewRepository.save(any(NurseReview.class))).thenReturn(review);

        NurseReview result = reviewService.addNurseReview("user@mail.com", req);

        assertEquals(4, result.getRating());
        verify(nurseReviewRepository).save(any(NurseReview.class));
        verify(notificationService).notifyNurse(eq("nurse@mail.com"), anyString(), anyString(), anyString());
    }
}
