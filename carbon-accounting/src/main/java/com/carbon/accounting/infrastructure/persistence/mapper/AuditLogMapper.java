package com.carbon.accounting.infrastructure.persistence.mapper;

import com.carbon.accounting.core.domain.model.AuditLog;
import com.carbon.accounting.infrastructure.persistence.entity.AuditLogEntity;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLog toDomain(AuditLogEntity entity) {
        if (entity == null)
            return null;
        return AuditLog.builder()
                .id(entity.getId())
                .tenantId(entity.getTenantId())
                .userId(entity.getUserId())
                .action(entity.getAction())
                .resource(entity.getResource())
                .resourceId(entity.getResourceId())
                .details(entity.getDetails())
                .ipAddress(entity.getIpAddress())
                .timestamp(entity.getTimestamp())
                .build();
    }

    public AuditLogEntity toEntity(AuditLog domain) {
        if (domain == null)
            return null;
        return AuditLogEntity.builder()
                .id(domain.getId())
                .tenantId(domain.getTenantId())
                .userId(domain.getUserId())
                .action(domain.getAction())
                .resource(domain.getResource())
                .resourceId(domain.getResourceId())
                .details(domain.getDetails())
                .ipAddress(domain.getIpAddress())
                .timestamp(domain.getTimestamp())
                .build();
    }
}
