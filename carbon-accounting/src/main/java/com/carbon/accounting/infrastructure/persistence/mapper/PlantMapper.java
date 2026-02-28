package com.carbon.accounting.infrastructure.persistence.mapper;

import com.carbon.accounting.core.domain.model.Plant;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import org.springframework.stereotype.Component;

@Component
public class PlantMapper {

    public Plant toDomain(PlantEntity entity) {
        if (entity == null)
            return null;
        return Plant.builder()
                .id(entity.getId())
                .industryId(entity.getIndustry().getId())
                .name(entity.getName())
                .location(entity.getLocation())
                .tenantId(entity.getTenantId())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public PlantEntity toEntity(Plant domain, IndustryEntity industry) {
        if (domain == null)
            return null;
        return PlantEntity.builder()
                .id(domain.getId())
                .industry(industry)
                .name(domain.getName())
                .location(domain.getLocation())
                .tenantId(domain.getTenantId())
                .build();
    }
}
