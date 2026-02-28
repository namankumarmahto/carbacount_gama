package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.domain.model.Plant;
import com.carbon.accounting.core.repository.PlantRepository;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import com.carbon.accounting.infrastructure.persistence.mapper.PlantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaPlantRepository implements PlantRepository {

    private final SpringDataPlantRepository repository;
    private final SpringDataIndustryRepository industryRepository;
    private final PlantMapper mapper;

    @Override
    public Plant save(Plant plant) {
        IndustryEntity industry = industryRepository.findById(plant.getIndustryId())
                .orElseThrow(() -> new IllegalArgumentException("Industry not found"));

        PlantEntity entity = mapper.toEntity(plant, industry);
        PlantEntity saved = repository.save(entity);

        return mapper.toDomain(saved);
    }

    @Override
    public Optional<Plant> findById(UUID id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Plant> findByTenantAndIndustry(UUID tenantId, UUID industryId) {
        return repository.findByTenantIdAndIndustryId(tenantId, industryId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
