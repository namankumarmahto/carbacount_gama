package com.carbon.accounting.application.mapper;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.application.dto.EmissionResponseDTO;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import org.springframework.stereotype.Component;
import java.util.UUID;
import java.time.Instant;

@Component
public class EmissionApplicationMapper {

    public EmissionRecord toDomain(AddEmissionRequestDTO request) {
        if (request == null)
            return null;
        return EmissionRecord.builder()
                .id(UUID.randomUUID())
                .plantId(request.getPlantId())
                .scope(request.getScope())
                .categoryId(request.getCategoryId())
                .customCategoryName(request.getCustomCategoryName())
                .activityType(request.getActivityType())
                .activityQuantity(request.getQuantity())
                .recordedAt(request.getRecordedAt())
                .createdAt(Instant.now())
                .build();
    }

    public EmissionResponseDTO toResponse(EmissionRecord record) {
        if (record == null)
            return null;
        return EmissionResponseDTO.builder()
                .emissionId(record.getId())
                .activityType(record.getActivityType())
                .activityQuantity(record.getActivityQuantity())
                .activityUnit(record.getActivityUnit())
                .emissionFactor(record.getEmissionFactor())
                .calculatedEmission(record.getCalculatedEmission())
                .recordedAt(record.getRecordedAt())
                .plantId(record.getPlantId())
                .tenantId(record.getTenantId())
                .department(record.getDepartment())
                .reportingFrequency(record.getReportingFrequency())
                .dataSource(record.getDataSource())
                .evidenceUrl(record.getEvidenceUrl())
                .status(record.getStatus())
                .responsiblePerson(record.getResponsiblePerson())
                .reportingPeriodStart(record.getReportingPeriodStart())
                .reportingPeriodEnd(record.getReportingPeriodEnd())
                .fuelType(record.getFuelType())
                .calorificValue(record.getCalorificValue())
                .build();
    }
}
