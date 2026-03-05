package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.repository.EmissionFactorRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionFactorEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class JpaEmissionFactorRepository implements EmissionFactorRepository {

    private final SpringDataEmissionFactorRepository repository;

    @Override
    public Optional<EmissionFactorEntity> findByLocationAndFuelType(UUID industryTypeId, String scope, UUID fuelTypeId,
            UUID countryId, UUID stateId) {
        return repository.findByIndustryTypeIdAndScopeAndFuelTypeIdAndCountryIdAndStateId(industryTypeId, scope,
                fuelTypeId, countryId, stateId);
    }

    @Override
    public List<EmissionFactorEntity> findByLocationAndScope(UUID industryTypeId, String scope, UUID countryId,
            UUID stateId) {
        return repository.findByIndustryTypeIdAndScopeAndCountryIdAndStateId(industryTypeId, scope, countryId, stateId);
    }
}
