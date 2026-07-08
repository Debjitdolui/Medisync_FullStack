package com.medisync.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicineRequest {
    @NotNull private Long pharmacyId;
    @NotNull private Long masterMedicineId;
    private String brand;
    @NotNull @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0") private BigDecimal price;
    @Min(value = 0, message = "Stock quantity cannot be negative") private int stockQuantity;
    private String description;
}
