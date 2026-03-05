package com.carbon.accounting.application.dto;

import lombok.Data;

@Data
public class DraftActivityDTO {
    private String activityType;
    private Double quantity;
    private String fuelType;
    private java.util.UUID fuelTypeId;
    private Double calorificValue;
}
