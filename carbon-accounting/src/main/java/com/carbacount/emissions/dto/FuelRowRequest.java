package com.carbacount.emissions.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelRowRequest {
    private String fuelType;
    private String unit;
    private BigDecimal quantity;
}
