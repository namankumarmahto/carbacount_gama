package com.carbon.accounting.infrastructure.persistence.mapper;

import com.carbon.accounting.core.domain.model.EnergyRecord;
import com.carbon.accounting.infrastructure.persistence.entity.EnergyRecordEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import org.springframework.stereotype.Component;

@Component
public class EnergyMapper {

    public EnergyRecord toDomain(EnergyRecordEntity entity) {
        if (entity == null)
            return null;
        return EnergyRecord.builder()
                .id(entity.getId())
                .plantId(entity.getPlant().getId())
                .electricityKwh(entity.getElectricityKwh())
                .fuelUsed(entity.getFuelUsed())
                .fuelType(entity.getFuelType())
                .tenantId(entity.getTenantId())
                .recordedAt(entity.getRecordedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public EnergyRecordEntity toEntity(EnergyRecord domain, PlantEntity plant) {
        if (domain == null)
            return null;
        return EnergyRecordEntity.builder()
                .id(domain.getId())
                .plant(plant)
                .electricityKwh(domain.getElectricityKwh())
                .fuelUsed(domain.getFuelUsed())
                .fuelType(domain.getFuelType())
                .tenantId(domain.getTenantId())
                .recordedAt(domain.getRecordedAt())
                .build();
    }
}
