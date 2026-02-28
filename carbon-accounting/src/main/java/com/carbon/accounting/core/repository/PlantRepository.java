package com.carbon.accounting.core.repository;

import com.carbon.accounting.core.domain.model.Plant;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface PlantRepository {
    Plant save(Plant plant);

    Optional<Plant> findById(UUID id);

    List<Plant> findByTenantAndIndustry(UUID tenantId, UUID industryId);
}
