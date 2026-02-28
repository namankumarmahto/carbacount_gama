package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;
import java.time.LocalDateTime;

@Getter
@Builder
public class EnergyRecord {
    private final UUID id;
    private final UUID plantId;
    private final Double electricityKwh;
    private final Double fuelUsed;
    private final String fuelType;
    private final UUID tenantId;
    private final LocalDateTime recordedAt;
    private final LocalDateTime createdAt;

    public EnergyRecord(UUID id, UUID plantId, Double electricityKwh, Double fuelUsed, String fuelType,
            UUID tenantId, LocalDateTime recordedAt, LocalDateTime createdAt) {
        if (plantId == null) {
            throw new IllegalArgumentException("Plant ID cannot be null");
        }
        if (recordedAt == null) {
            throw new IllegalArgumentException("Recorded at timestamp cannot be null");
        }
        this.id = id;
        this.plantId = plantId;
        this.electricityKwh = electricityKwh;
        this.fuelUsed = fuelUsed;
        this.fuelType = fuelType;
        this.tenantId = tenantId;
        this.recordedAt = recordedAt;
        this.createdAt = createdAt;
    }
}
