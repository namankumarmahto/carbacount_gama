package com.carbacount.audit.repository;

import com.carbacount.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByOrganizationId(UUID organizationId);

    List<AuditLog> findByOrganizationIdIn(List<UUID> organizationIds);
}
