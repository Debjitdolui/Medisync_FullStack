package com.medisync.repository;

import com.medisync.entity.PharmacyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PharmacyReviewRepository extends JpaRepository<PharmacyReview, Long> {
    List<PharmacyReview> findByPharmacyPharmacyId(Long pharmacyId);
    Page<PharmacyReview> findByPharmacyPharmacyId(Long pharmacyId, Pageable pageable);
}
