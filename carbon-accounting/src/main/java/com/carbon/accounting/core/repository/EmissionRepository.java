package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import java.util.UUID;
import java.util.List;

public interface EmissionRepository {
    EmissionRecord save(EmissionRecord record);

    List<EmissionRecord> findByTenantAndPlant(UUID tenantId, UUID plantId);

    List<EmissionRecord> findByTenantAndPlantAndStatus(UUID tenantId, UUID plantId, String status);

    List<EmissionRecord> findByTenantAndScope(UUID tenantId, String scope);

    List<EmissionRecord> findByTenantAndScopeAndStatus(UUID tenantId, String scope, String status);

    List<EmissionRecord> findByTenant(UUID tenantId);

    List<EmissionRecord> findByTenantAndStatus(UUID tenantId, String status);

    java.util.Optional<EmissionRecord> findById(UUID id);
}
