package com.carbacount.emissions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealtimeEmissionRequest {
    private UUID facilityId;
    private String scope;
    private String fuelType;
    private String electricitySource;
    private String category;
    private String subCategory;
    private String unit;
    private BigDecimal quantity;
}
