package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PharmacySearchResult {
    private Long pharmacyId;
    private String pharmacyName;
    private String address;
    private String city;
    private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal totalPrice;
    private double distanceKm;
    private int medicinesFound;
    private int totalSearched;
    private boolean hasAllMedicines;
    private List<MedicineItem> medicines;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicineItem {
        private Long medicineId;
        private String medicineName;
        private String brand;
        private BigDecimal price;
        private int stockQuantity;
        private String categoryName;
    }
}
