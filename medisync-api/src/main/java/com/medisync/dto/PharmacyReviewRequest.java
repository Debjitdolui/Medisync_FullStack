package com.medisync.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PharmacyReviewRequest {
    @NotNull private Long pharmacyId;
    @Min(1) @Max(5) private int rating;
    private String reviewText;
}
