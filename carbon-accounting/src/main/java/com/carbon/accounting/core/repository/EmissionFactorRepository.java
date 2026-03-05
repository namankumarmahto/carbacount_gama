package com.carbon.accounting.core.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EmissionFactorEntity;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface EmissionFactorRepository {
    Optional<EmissionFactorEntity> findByLocationAndFuelType(UUID industryTypeId, String scope, UUID fuelTypeId,
            UUID countryId, UUID stateId);

    List<EmissionFactorEntity> findByLocationAndScope(UUID industryTypeId, String scope, UUID countryId, UUID stateId);
}
