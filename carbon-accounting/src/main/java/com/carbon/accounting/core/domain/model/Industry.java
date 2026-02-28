package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.util.UUID;
import java.time.LocalDateTime;

@Getter
@Builder
public class Industry {
    private final UUID id;
    private final String name;
    private final String sector;
    private final String location;
    private final UUID tenantId;
    private final LocalDateTime createdAt;

    public Industry(UUID id, String name, String sector, String location, UUID tenantId, LocalDateTime createdAt) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Industry name cannot be empty");
        }
        this.id = id;
        this.name = name;
        this.sector = sector;
        this.location = location;
        this.tenantId = tenantId;
        this.createdAt = createdAt;
    }
}
