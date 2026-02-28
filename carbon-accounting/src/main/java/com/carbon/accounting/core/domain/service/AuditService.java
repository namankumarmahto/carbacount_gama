package com.carbon.accounting.core.domain.service;

import java.util.UUID;

public interface AuditService {
    void logAction(UUID tenantId, String userId, String action, String resource, String resourceId, String details);
}
