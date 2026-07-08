package com.medisync.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class NurseRegisterRequest {
    @NotBlank private String fullName;
    @NotBlank private String email;
    @NotBlank private String password;
    @NotBlank private String phone;
    @NotBlank private String qualification;
    @NotBlank private String licenseNumber;
    private String specialization;
    private List<Long> serviceIds;
}
