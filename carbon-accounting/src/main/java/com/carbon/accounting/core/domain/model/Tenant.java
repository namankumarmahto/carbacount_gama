package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class Tenant {
    private UUID id;
    private String name;
    private String industryType;
    private Instant createdAt;
    private boolean active;
}
