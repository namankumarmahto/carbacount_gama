package com.carbacount.emissions.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElectricityRowRequest {
    private String electricitySource;
    private String unit;
    private BigDecimal quantity;
}
