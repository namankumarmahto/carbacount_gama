package com.carbon.accounting.infrastructure.persistence.mapper;

import com.carbon.accounting.core.domain.model.Industry;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import org.springframework.stereotype.Component;

@Component
public class IndustryMapper {

    public Industry toDomain(IndustryEntity entity) {
        if (entity == null)
            return null;
        return Industry.builder()
                .id(entity.getId())
                .name(entity.getName())
                .sector(entity.getSector())
                .location(entity.getLocation())
                .tenantId(entity.getTenantId())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public IndustryEntity toEntity(Industry domain) {
        if (domain == null)
            return null;
        return IndustryEntity.builder()
                .id(domain.getId())
                .name(domain.getName())
                .sector(domain.getSector())
                .location(domain.getLocation())
                .tenantId(domain.getTenantId())
                .build();
    }
}
