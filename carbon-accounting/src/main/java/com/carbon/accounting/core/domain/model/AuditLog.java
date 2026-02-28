package com.carbon.accounting.core.domain.model;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class AuditLog {
    private final UUID id;
    private final UUID tenantId;
    private final String userId;
    private final String action;
    private final String resource;
    private final String resourceId;
    private final String details;
    private final String ipAddress;
    private final Instant timestamp;
}
