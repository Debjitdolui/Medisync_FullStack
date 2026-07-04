package com.medisync.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String username;
    private String phone;
}
