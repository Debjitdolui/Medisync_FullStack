package com.medisync.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class NurseReviewRequest {
    @NotNull private Long nurseId;
    @NotNull private Long requestId;
    @Min(1) @Max(5) private int rating;
    private String reviewText;
}
