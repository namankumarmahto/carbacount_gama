package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;
import java.time.Instant;

@Getter
@Builder
public class EmissionRecord {
    private final UUID id;
    private UUID plantId;

    private String scope;
    private UUID categoryId;
    private String customCategoryName;

    private String activityType;
    private Double activityQuantity;
    private String activityUnit;
    private Double emissionFactor;
    private String factorSource;
    private Integer factorYear;
    private Double calculatedEmission;

    // Audit and Wizard fields
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

    private final UUID tenantId;
    private final UUID industryId;
    private final Instant committedAt;
    private final Instant recordedAt;
    private final Instant createdAt;

    public EmissionRecord(UUID id, UUID plantId, String scope, UUID categoryId, String customCategoryName,
            String activityType, Double activityQuantity, String activityUnit, Double emissionFactor,
            String factorSource, Integer factorYear, Double calculatedEmission,
            String department, String reportingFrequency, String dataSource, String evidenceUrl, String status,
            String responsiblePerson, Instant reportingPeriodStart, Instant reportingPeriodEnd,
            String fuelType, Double calorificValue,
            UUID tenantId, UUID industryId, Instant committedAt, Instant recordedAt, Instant createdAt) {
        if (plantId == null) {
            throw new IllegalArgumentException("Plant ID cannot be null");
        }
        if (recordedAt == null) {
            throw new IllegalArgumentException("Recorded at timestamp cannot be null");
        }
        this.id = id;
        this.plantId = plantId;
        this.scope = scope;
        this.categoryId = categoryId;
        this.customCategoryName = customCategoryName;
        this.activityType = activityType;
        this.activityQuantity = activityQuantity;
        this.activityUnit = activityUnit;
        this.emissionFactor = emissionFactor;
        this.factorSource = factorSource;
        this.factorYear = factorYear;
        this.calculatedEmission = calculatedEmission;
        this.department = department;
        this.reportingFrequency = reportingFrequency;
        this.dataSource = dataSource;
        this.evidenceUrl = evidenceUrl;
        this.status = status;
        this.responsiblePerson = responsiblePerson;
        this.reportingPeriodStart = reportingPeriodStart;
        this.reportingPeriodEnd = reportingPeriodEnd;
        this.fuelType = fuelType;
        this.calorificValue = calorificValue;
        this.tenantId = tenantId;
        this.industryId = industryId;
        this.committedAt = committedAt;
        this.recordedAt = recordedAt;
        this.createdAt = createdAt;
    }
}
