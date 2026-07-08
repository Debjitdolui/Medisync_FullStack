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

    @Query("SELECT m FROM Medicine m JOIN FETCH m.pharmacy p WHERE m.masterMedicine.masterMedicineId IN :masterIds AND m.stockQuantity > 0 AND p.approvalStatus = 'approved' AND (p.isBlocked = false OR p.isBlocked IS NULL)")
    List<Medicine> findByMasterMedicineIdsAndInStock(@Param("masterIds") List<Long> masterIds);

    @Query("SELECT m FROM Medicine m JOIN FETCH m.pharmacy p WHERE LOWER(m.medicineName) IN :names AND m.stockQuantity > 0 AND p.approvalStatus = 'approved' AND (p.isBlocked = false OR p.isBlocked IS NULL)")
    List<Medicine> findByMedicineNameInAndInStock(@Param("names") List<String> names);

    @Query("SELECT DISTINCT m.medicineName FROM Medicine m WHERE m.stockQuantity > 0 ORDER BY m.medicineName")
    List<String> findAllDistinctMedicineNames();
}
