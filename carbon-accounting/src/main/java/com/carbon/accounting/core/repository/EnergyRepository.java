package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.EnergyRecord;
import java.util.UUID;
import java.util.List;

public interface EnergyRepository {
    EnergyRecord save(EnergyRecord record);

    List<EnergyRecord> findByTenantAndPlant(UUID tenantId, UUID plantId);
}
