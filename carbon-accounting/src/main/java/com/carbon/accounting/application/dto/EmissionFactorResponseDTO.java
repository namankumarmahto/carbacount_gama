package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmissionFactorResponseDTO {
    private String activityType;
    private String unit;
    private Double factorValue;
    private String source;
    private Integer year;
}
