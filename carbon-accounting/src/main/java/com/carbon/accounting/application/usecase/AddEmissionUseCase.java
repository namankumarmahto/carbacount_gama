package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.application.dto.EmissionResponseDTO;
import com.carbon.accounting.application.mapper.EmissionApplicationMapper;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.domain.service.EmissionDomainService;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.core.repository.PlantRepository;
import com.carbon.accounting.application.exception.PlantNotFoundException;
import com.carbon.accounting.core.repository.EmissionFactorRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionFactorEntity;
import com.carbon.accounting.application.exception.EmissionFactorNotFoundException;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AddEmissionUseCase {

        private final EmissionRepository emissionRepository;
        private final PlantRepository plantRepository;
        private final EmissionFactorRepository factorRepository;
        private final EmissionDomainService domainService;
        private final EmissionApplicationMapper mapper;
        private final com.carbon.accounting.core.domain.service.AuditService auditService;

        @Transactional
        @CacheEvict(value = "dashboard", allEntries = true)
        public EmissionResponseDTO execute(AddEmissionRequestDTO request) {
                // Get user context
                UserPrincipal userPrincipal = (UserPrincipal) org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getPrincipal();

                // Validate plant existence
                plantRepository.findById(request.getPlantId())
                                .orElseThrow(() -> new PlantNotFoundException(
                                                "Plant with ID " + request.getPlantId() + " not found"));

                // Fetch Emission Factor
                EmissionFactorEntity factorEntity = factorRepository.findByLocationAndFuelType(
                                userPrincipal.getIndustryTypeId(),
                                request.getScope(),
                                request.getFuelTypeId(),
                                userPrincipal.getCountryId(),
                                userPrincipal.getStateId())
                                .orElseThrow(() -> new EmissionFactorNotFoundException(
                                                "No emission factor found for fuel type: " + request.getFuelType()
                                                                + " in your region"));

                // Perform Calculation (kgCO2e to tCO2e conversion: factor * quantity / 1000)
                Double calculatedEmission = (request.getQuantity() * factorEntity.getFactorValue()) / 1000.0;

                // Build Domain Model
                EmissionRecord domainModel = EmissionRecord.builder()
                                .id(UUID.randomUUID())
                                .plantId(request.getPlantId())
                                .scope(request.getScope())
                                .categoryId(request.getCategoryId())
                                .customCategoryName(request.getCustomCategoryName())
                                .activityType(request.getActivityType())
                                .activityQuantity(request.getQuantity())
                                .activityUnit("TBD") // To be fetched from fuel type later
                                .emissionFactor(factorEntity.getFactorValue())
                                .factorSource(factorEntity.getSource())
                                .factorYear(factorEntity.getYear())
                                .calculatedEmission(calculatedEmission)
                                .status(request.getStatus())
                                .committedAt("COMMITTED".equals(request.getStatus()) ? java.time.Instant.now() : null)
                                .responsiblePerson(request.getResponsiblePerson())
                                .reportingPeriodStart(request.getReportingPeriodStart())
                                .reportingPeriodEnd(request.getReportingPeriodEnd())
                                .fuelType(request.getFuelType())
                                .calorificValue(request.getCalorificValue())
                                .tenantId(userPrincipal.getTenantId())
                                .industryId(userPrincipal.getIndustryId()) // Map industryId from context
                                .recordedAt(request.getRecordedAt())
                                .department(request.getDepartment())
                                .reportingFrequency(request.getReportingFrequency())
                                .dataSource(request.getDataSource())
                                .evidenceUrl(request.getEvidenceUrl())
                                .createdAt(java.time.Instant.now())
                                .build();

                // Domain validation
                domainService.validateEmissionRecord(domainModel);

                // Save
                EmissionRecord savedRecord = emissionRepository.save(domainModel);

                // Log audit action with calculation details
                auditService.logAction(
                                userPrincipal.getTenantId(),
                                userPrincipal.getUsername(),
                                "CREATE_ACTIVITY_EMISSION",
                                "EMISSION_RECORD",
                                savedRecord.getId().toString(),
                                String.format("Calculated emission: %.2f tCO2e for %s (Qty: %.2f %s)",
                                                calculatedEmission, request.getActivityType(), request.getQuantity(),
                                                "TBD"));

                // Return response
                return mapper.toResponse(savedRecord);
        }
}
