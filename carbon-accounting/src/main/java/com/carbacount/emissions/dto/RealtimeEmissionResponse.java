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
public class RealtimeEmissionResponse {
    private BigDecimal emissionFactor;
    private BigDecimal calculatedEmission;
}
