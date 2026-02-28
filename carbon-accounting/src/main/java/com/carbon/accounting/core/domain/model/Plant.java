package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;
import java.time.LocalDateTime;

@Getter
@Builder
public class Plant {
    private final UUID id;
    private final UUID industryId;
    private final String name;
    private final String location;
    private final UUID tenantId;
    private final LocalDateTime createdAt;

    public Plant(UUID id, UUID industryId, String name, String location, UUID tenantId, LocalDateTime createdAt) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Plant name cannot be empty");
        }
        if (industryId == null) {
            throw new IllegalArgumentException("Industry ID cannot be null");
        }
        this.id = id;
        this.industryId = industryId;
        this.name = name;
        this.location = location;
        this.tenantId = tenantId;
        this.createdAt = createdAt;
    }
}
