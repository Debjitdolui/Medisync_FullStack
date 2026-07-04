package com.medisync.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class PharmacySearchResult {
    private Long pharmacyId;
    private String pharmacyName;
    private BigDecimal totalPrice;
    private double distanceKm;
    private int medicinesFound;
    private int totalSearched;
    private boolean hasAllMedicines;
}
