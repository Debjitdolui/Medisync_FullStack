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
    @NotNull private BigDecimal price;
    private int stockQuantity;
    private LocalDate expiryDate;
    private String description;
}
