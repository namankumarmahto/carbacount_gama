package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.domain.model.AuditLog;
import com.carbon.accounting.core.repository.AuditRepository;
import com.carbon.accounting.infrastructure.persistence.entity.AuditLogEntity;
import com.carbon.accounting.infrastructure.persistence.mapper.AuditLogMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaAuditRepository implements AuditRepository {

    private final SpringDataAuditLogRepository repository;
    private final AuditLogMapper mapper;

    @Override
    public AuditLog save(AuditLog auditLog) {
        AuditLogEntity entity = mapper.toEntity(auditLog);
        AuditLogEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<AuditLog> findByTenant(UUID tenantId) {
        return repository.findByTenantIdOrderByTimestampDesc(tenantId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
