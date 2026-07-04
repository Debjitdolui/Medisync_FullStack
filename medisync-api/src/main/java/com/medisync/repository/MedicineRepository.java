package com.medisync.repository;

import com.medisync.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByPharmacyPharmacyId(Long pharmacyId);
    Page<Medicine> findByPharmacyPharmacyId(Long pharmacyId, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.medicineName) LIKE LOWER(CONCAT('%',:name,'%')) AND m.stockQuantity > 0")
    List<Medicine> searchByName(@Param("name") String name);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.medicineName) LIKE LOWER(CONCAT('%',:name,'%')) AND m.stockQuantity > 0")
    Page<Medicine> searchByName(@Param("name") String name, Pageable pageable);

    @Query("SELECT m FROM Medicine m JOIN FETCH m.pharmacy p WHERE LOWER(m.medicineName) IN :names AND m.stockQuantity > 0 AND p.approvalStatus = 'approved'")
    List<Medicine> findByMedicineNameInAndInStock(@Param("names") List<String> names);
}
