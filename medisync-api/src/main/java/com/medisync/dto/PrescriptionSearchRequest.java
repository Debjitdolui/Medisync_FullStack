package com.medisync.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PrescriptionSearchRequest {
    @NotEmpty private List<String> medicineNames;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal maxDistanceKm;
}
