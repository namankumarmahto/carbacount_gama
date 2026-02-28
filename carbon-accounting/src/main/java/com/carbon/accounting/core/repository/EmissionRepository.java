package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import java.util.UUID;
import java.util.List;

public interface EmissionRepository {
    EmissionRecord save(EmissionRecord record);

    List<EmissionRecord> findByTenantAndPlant(UUID tenantId, UUID plantId);
}
