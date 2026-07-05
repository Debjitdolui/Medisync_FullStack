package com.medisync.repository;

import com.medisync.entity.PharmacyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PharmacyImageRepository extends JpaRepository<PharmacyImage, Long> {
    List<PharmacyImage> findByPharmacyPharmacyIdOrderByDisplayOrderAsc(Long pharmacyId);
    int countByPharmacyPharmacyId(Long pharmacyId);
}
