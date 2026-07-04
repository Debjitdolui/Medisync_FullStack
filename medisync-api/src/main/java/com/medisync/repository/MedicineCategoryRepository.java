package com.medisync.repository;

import com.medisync.entity.MedicineCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineCategoryRepository extends JpaRepository<MedicineCategory, Long> {
}
