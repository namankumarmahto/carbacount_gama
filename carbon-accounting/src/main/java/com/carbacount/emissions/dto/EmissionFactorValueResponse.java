package com.carbacount.emissions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactorValueResponse {
    private String scope;
    private String industry;
    private String activityType;
    private String source;
    private String unit;
    private BigDecimal factorValue;
    private String factorUnit;
    private Integer year;
}
