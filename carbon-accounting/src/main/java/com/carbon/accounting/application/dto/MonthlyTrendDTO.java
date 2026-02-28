package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MonthlyTrendDTO {
    private String month;
    private Double emission;
}
