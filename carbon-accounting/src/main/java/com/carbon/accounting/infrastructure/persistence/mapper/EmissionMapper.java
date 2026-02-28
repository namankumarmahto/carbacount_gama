package com.carbon.accounting.infrastructure.persistence.mapper;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionRecordEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import org.springframework.stereotype.Component;

@Component
public class EmissionMapper {

    public EmissionRecord toDomain(EmissionRecordEntity entity) {
        if (entity == null)
            return null;
        return EmissionRecord.builder()
                .id(entity.getId())
                .plantId(entity.getPlant().getId())
                .scope(entity.getScope())
                .categoryId(entity.getCategoryId())
                .customCategoryName(entity.getCustomCategoryName())
                .totalEmission(entity.getTotalEmission())
                .tenantId(entity.getTenantId())
                .recordedAt(entity.getRecordedAt())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public EmissionRecordEntity toEntity(EmissionRecord domain, PlantEntity plant) {
        if (domain == null)
            return null;
        return EmissionRecordEntity.builder()
                .id(domain.getId())
                .plant(plant)
                .scope(domain.getScope())
                .categoryId(domain.getCategoryId())
                .customCategoryName(domain.getCustomCategoryName())
                .totalEmission(domain.getTotalEmission())
                .tenantId(domain.getTenantId())
                .recordedAt(domain.getRecordedAt())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
