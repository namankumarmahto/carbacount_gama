package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EmissionFactorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface SpringDataEmissionFactorRepository extends JpaRepository<EmissionFactorEntity, UUID> {
    Optional<EmissionFactorEntity> findByIndustryTypeIdAndScopeAndFuelTypeIdAndCountryIdAndStateId(UUID industryTypeId,
            String scope, UUID fuelTypeId, UUID countryId, UUID stateId);

    List<EmissionFactorEntity> findByIndustryTypeIdAndScopeAndCountryIdAndStateId(UUID industryTypeId, String scope,
            UUID countryId, UUID stateId);
}
