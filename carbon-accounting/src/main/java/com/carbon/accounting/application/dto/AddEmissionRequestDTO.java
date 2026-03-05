package com.carbon.accounting.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.PastOrPresent;
import java.time.Instant;
import java.util.UUID;

@Data
public class AddEmissionRequestDTO {
    @NotNull(message = "Plant ID is required")
    private UUID plantId;

    private String scope;
    private UUID categoryId;
    private String customCategoryName;

    @NotNull(message = "Activity type is required")
    private String activityType;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity must be positive or zero")
    private Double quantity;

    @NotNull(message = "Recorded at timestamp is required")
    private Instant recordedAt;

    private String department;
    private String reportingFrequency;
    private String dataSource;
    private String evidenceUrl;
    private String status;
    private String responsiblePerson;
    private Instant reportingPeriodStart;
    private Instant reportingPeriodEnd;
    private String fuelType;
    private UUID fuelTypeId;
    private Double calorificValue;
}
