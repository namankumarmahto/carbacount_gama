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
                .activityType(entity.getActivityType())
                .activityQuantity(entity.getActivityQuantity())
                .activityUnit(entity.getActivityUnit())
                .emissionFactor(entity.getEmissionFactor())
                .factorSource(entity.getFactorSource())
                .factorYear(entity.getFactorYear())
                .calculatedEmission(entity.getCalculatedEmission())
                .department(entity.getDepartment())
                .reportingFrequency(entity.getReportingFrequency())
                .dataSource(entity.getDataSource())
                .evidenceUrl(entity.getEvidenceUrl())
                .status(entity.getStatus())
                .responsiblePerson(entity.getResponsiblePerson())
                .reportingPeriodStart(entity.getReportingPeriodStart())
                .reportingPeriodEnd(entity.getReportingPeriodEnd())
                .fuelType(entity.getFuelType())
                .calorificValue(entity.getCalorificValue())
                .tenantId(entity.getTenantId())
                .industryId(entity.getIndustryId())
                .committedAt(entity.getCommittedAt())
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
                .activityType(domain.getActivityType())
                .activityQuantity(domain.getActivityQuantity())
                .activityUnit(domain.getActivityUnit())
                .emissionFactor(domain.getEmissionFactor())
                .factorSource(domain.getFactorSource())
                .factorYear(domain.getFactorYear())
                .calculatedEmission(domain.getCalculatedEmission())
                .department(domain.getDepartment())
                .reportingFrequency(domain.getReportingFrequency())
                .dataSource(domain.getDataSource())
                .evidenceUrl(domain.getEvidenceUrl())
                .status(domain.getStatus())
                .responsiblePerson(domain.getResponsiblePerson())
                .reportingPeriodStart(domain.getReportingPeriodStart())
                .reportingPeriodEnd(domain.getReportingPeriodEnd())
                .fuelType(domain.getFuelType())
                .calorificValue(domain.getCalorificValue())
                .tenantId(domain.getTenantId())
                .industryId(domain.getIndustryId())
                .committedAt(domain.getCommittedAt())
                .recordedAt(domain.getRecordedAt())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
