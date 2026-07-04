package com.medisync.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class NurseRequestDto {
    private Long nurseId;
    private Long serviceId;
    private String address;
    private String healthIssue;
    private LocalDate requestDate;
    private String preferredTime;
}
