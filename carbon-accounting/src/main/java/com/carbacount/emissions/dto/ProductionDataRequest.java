package com.carbacount.emissions.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionDataRequest {
    private BigDecimal totalProduction;
    private String unit;
}
