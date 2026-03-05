package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EmissionResponseDTO {
    private UUID emissionId;
    private String activityType;
    private Double activityQuantity;
    private String activityUnit;
    private Double emissionFactor;
    private Double calculatedEmission;
    private Instant recordedAt;
    private UUID plantId;
    private UUID tenantId;

    private String department;
    private String reportingFrequency;
    private String dataSource;
    private String evidenceUrl;
    private String status;
    private String responsiblePerson;
    private Instant reportingPeriodStart;
    private Instant reportingPeriodEnd;
    private String fuelType;
    private Double calorificValue;
}
