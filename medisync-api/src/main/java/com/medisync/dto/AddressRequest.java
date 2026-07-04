package com.medisync.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddressRequest {
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault;
}
