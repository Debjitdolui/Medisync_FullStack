package com.medisync.repository;

import com.medisync.entity.NurseReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NurseReviewRepository extends JpaRepository<NurseReview, Long> {
    List<NurseReview> findByNurseNurseId(Long nurseId);
    Page<NurseReview> findByNurseNurseId(Long nurseId, Pageable pageable);
}
