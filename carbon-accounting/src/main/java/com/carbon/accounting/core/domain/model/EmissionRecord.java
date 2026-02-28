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

    private Double totalEmission;
    private final UUID tenantId;
    private final Instant recordedAt;
    private final Instant createdAt;

    public EmissionRecord(UUID id, UUID plantId, String scope, UUID categoryId, String customCategoryName,
            Double totalEmission,
            UUID tenantId, Instant recordedAt, Instant createdAt) {
        if (plantId == null) {
            throw new IllegalArgumentException("Plant ID cannot be null");
        }
        if (recordedAt == null) {
            throw new IllegalArgumentException("Recorded at timestamp cannot be null");
        }
        this.id = id;
        this.plantId = plantId;
        this.scope = scope; // Corrected from scope1
        this.categoryId = categoryId;
        this.customCategoryName = customCategoryName;
        this.totalEmission = totalEmission; // Assign directly from parameter
        this.tenantId = tenantId;
        this.recordedAt = recordedAt;
        this.createdAt = createdAt;
    }
}
