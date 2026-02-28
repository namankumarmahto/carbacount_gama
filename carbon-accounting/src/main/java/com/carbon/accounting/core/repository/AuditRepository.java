package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.AuditLog;

import java.util.List;
import java.util.UUID;

public interface AuditRepository {
    AuditLog save(AuditLog auditLog);

    List<AuditLog> findByTenant(UUID tenantId);
}
