package com.carbacount.emissions.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scope3RowRequest {
    private String category;
    private String subCategory;
    private String unit;
    private BigDecimal quantity;
}
