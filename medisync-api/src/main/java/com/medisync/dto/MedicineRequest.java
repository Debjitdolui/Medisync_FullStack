package com.medisync.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineRequest {
    @NotNull private Long pharmacyId;
    @NotNull private Long categoryId;
    @NotBlank private String medicineName;
    private String manufacturer;
    @NotNull @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0") private BigDecimal price;
    @Min(value = 0, message = "Stock quantity cannot be negative") private int stockQuantity;
    private LocalDate expiryDate;
    private String description;
}
