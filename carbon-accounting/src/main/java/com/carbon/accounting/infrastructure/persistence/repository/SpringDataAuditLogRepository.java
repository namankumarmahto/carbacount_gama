package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataAuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {
    List<AuditLogEntity> findByTenantIdOrderByTimestampDesc(UUID tenantId);
}
