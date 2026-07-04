package com.medisync.repository;

import com.medisync.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
    List<Medicine> findByPharmacyPharmacyId(Long pharmacyId);

    @Query("SELECT m FROM Medicine m WHERE LOWER(m.medicineName) LIKE LOWER(CONCAT('%',:name,'%')) AND m.stockQuantity > 0")
    List<Medicine> searchByName(@Param("name") String name);

    @Query("SELECT m FROM Medicine m JOIN FETCH m.pharmacy p WHERE LOWER(m.medicineName) IN :names AND m.stockQuantity > 0 AND p.approvalStatus = 'approved'")
    List<Medicine> findByMedicineNameInAndInStock(@Param("names") List<String> names);
}
