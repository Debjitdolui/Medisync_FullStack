package com.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PharmacyRegisterRequest {
    @NotBlank private String ownerName;
    @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String pharmacyName;
    @NotBlank private String licenseNumber;
    @NotBlank private String address;
    @NotBlank private String city;
    @NotBlank private String state;
    @NotBlank private String pincode;
    @NotBlank private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
