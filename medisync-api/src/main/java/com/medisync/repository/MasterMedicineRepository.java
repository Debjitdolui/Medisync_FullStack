package com.medisync.repository;

import com.medisync.entity.MasterMedicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MasterMedicineRepository extends JpaRepository<MasterMedicine, Long> {

    Optional<MasterMedicine> findByMedicineNameIgnoreCase(String medicineName);

    boolean existsByMedicineNameIgnoreCase(String medicineName);

    @Query("SELECT m FROM MasterMedicine m WHERE LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MasterMedicine> searchByName(@Param("query") String query);

    @Query("SELECT m.medicineName FROM MasterMedicine m ORDER BY m.medicineName")
    List<String> findAllMedicineNames();

    List<MasterMedicine> findByCategoryCategoryId(Long categoryId);
}
