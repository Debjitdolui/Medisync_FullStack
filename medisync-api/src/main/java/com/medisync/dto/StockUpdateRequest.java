package com.medisync.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class StockUpdateRequest {
    @Min(1) private int quantity;
    @NotBlank @Pattern(regexp = "add|remove") private String action;
}
