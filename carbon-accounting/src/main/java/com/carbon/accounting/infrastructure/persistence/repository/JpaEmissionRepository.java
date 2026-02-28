package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionRecordEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import com.carbon.accounting.infrastructure.persistence.mapper.EmissionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JpaEmissionRepository implements EmissionRepository {

    private final SpringDataEmissionRepository repository;
    private final SpringDataPlantRepository plantRepository;
    private final EmissionMapper mapper;

    @Override
    public EmissionRecord save(EmissionRecord record) {
        PlantEntity plant = plantRepository.findById(record.getPlantId())
                .orElseThrow(() -> new IllegalArgumentException("Plant not found"));

        EmissionRecordEntity entity = mapper.toEntity(record, plant);
        EmissionRecordEntity saved = repository.save(entity);

        return mapper.toDomain(saved);
    }

    @Override
    public List<EmissionRecord> findByTenantAndPlant(UUID tenantId, UUID plantId) {
        return repository.findByTenantIdAndPlantId(tenantId, plantId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
