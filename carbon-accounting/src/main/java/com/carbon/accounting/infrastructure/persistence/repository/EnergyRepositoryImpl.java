package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.core.domain.model.EnergyRecord;
import com.carbon.accounting.core.repository.EnergyRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EnergyRecordEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import com.carbon.accounting.infrastructure.persistence.mapper.EnergyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EnergyRepositoryImpl implements EnergyRepository {

    private final SpringDataEnergyRepository repository;
    private final SpringDataPlantRepository plantRepository;
    private final EnergyMapper mapper;

    @Override
    public EnergyRecord save(EnergyRecord record) {
        PlantEntity plant = plantRepository.findById(record.getPlantId())
                .orElseThrow(() -> new IllegalArgumentException("Plant not found"));

        EnergyRecordEntity entity = mapper.toEntity(record, plant);
        EnergyRecordEntity saved = repository.save(entity);

        return mapper.toDomain(saved);
    }

    @Override
    public List<EnergyRecord> findByTenantAndPlant(UUID tenantId, UUID plantId) {
        return repository.findByTenantIdAndPlantId(tenantId, plantId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
