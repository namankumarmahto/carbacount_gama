package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.*;
import com.carbon.accounting.application.exception.EmissionFactorNotFoundException;
import com.carbon.accounting.application.exception.PlantNotFoundException;
import com.carbon.accounting.application.mapper.EmissionApplicationMapper;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.domain.service.AuditService;
import com.carbon.accounting.core.domain.service.EmissionDomainService;
import com.carbon.accounting.core.repository.EmissionFactorRepository;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.core.repository.PlantRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionFactorEntity;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DraftEmissionUseCase {

        private final EmissionRepository emissionRepository;
        private final PlantRepository plantRepository;
        private final EmissionFactorRepository factorRepository;
        private final EmissionDomainService domainService;
        private final EmissionApplicationMapper mapper;
        private final AuditService auditService;

        @Transactional
        public EmissionResponseDTO createDraft(DraftFacilityDTO dto) {
                UserPrincipal user = getUserPrincipal();

                plantRepository.findById(dto.getPlantId())
                                .orElseThrow(() -> new PlantNotFoundException("Plant not found: " + dto.getPlantId()));

                EmissionRecord draft = EmissionRecord.builder()
                                .id(UUID.randomUUID())
                                .plantId(dto.getPlantId())
                                .department(dto.getDepartment())
                                .responsiblePerson(dto.getResponsiblePerson())
                                .reportingPeriodStart(dto.getReportingPeriodStart())
                                .reportingPeriodEnd(dto.getReportingPeriodEnd())
                                .reportingFrequency(dto.getReportingFrequency())
                                .dataSource(dto.getDataSource())
                                .status("DRAFT")
                                .tenantId(user.getTenantId())
                                .industryId(user.getIndustryId())
                                .recordedAt(Instant.now())
                                .createdAt(Instant.now())
                                .build();

                EmissionRecord saved = emissionRepository.save(draft);
                return mapper.toResponse(saved);
        }

        @Transactional
        public EmissionResponseDTO updateClassification(UUID id, DraftClassificationDTO dto) {
                EmissionRecord draft = emissionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Draft not found"));

                validateOwnership(draft);

                EmissionRecord updated = EmissionRecord.builder()
                                .id(draft.getId())
                                .plantId(draft.getPlantId())
                                .department(draft.getDepartment())
                                .responsiblePerson(draft.getResponsiblePerson())
                                .reportingPeriodStart(draft.getReportingPeriodStart())
                                .reportingPeriodEnd(draft.getReportingPeriodEnd())
                                .reportingFrequency(draft.getReportingFrequency())
                                .dataSource(draft.getDataSource())
                                .status("DRAFT")
                                .tenantId(draft.getTenantId())
                                .industryId(draft.getIndustryId())
                                .recordedAt(draft.getRecordedAt())
                                .createdAt(draft.getCreatedAt())
                                // New updates
                                .scope(dto.getScope())
                                .categoryId(dto.getCategoryId())
                                .customCategoryName(dto.getCustomCategoryName())
                                .build();

                return mapper.toResponse(emissionRepository.save(updated));
        }

        @Transactional
        public EmissionResponseDTO updateActivity(UUID id, DraftActivityDTO dto) {
                EmissionRecord draft = emissionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Draft not found"));

                validateOwnership(draft);
                UserPrincipal user = getUserPrincipal();

                EmissionFactorEntity factor = factorRepository.findByLocationAndFuelType(
                                user.getIndustryTypeId(),
                                draft.getScope(),
                                dto.getFuelTypeId(),
                                user.getCountryId(),
                                user.getStateId())
                                .orElseThrow(() -> new EmissionFactorNotFoundException(
                                                "No factor for " + dto.getActivityType()));

                Double calculatedEmission = (dto.getQuantity() * factor.getFactorValue()) / 1000.0;

                EmissionRecord updated = EmissionRecord.builder()
                                .id(draft.getId())
                                .plantId(draft.getPlantId())
                                .department(draft.getDepartment())
                                .responsiblePerson(draft.getResponsiblePerson())
                                .reportingPeriodStart(draft.getReportingPeriodStart())
                                .reportingPeriodEnd(draft.getReportingPeriodEnd())
                                .reportingFrequency(draft.getReportingFrequency())
                                .dataSource(draft.getDataSource())
                                .status("DRAFT")
                                .tenantId(draft.getTenantId())
                                .industryId(draft.getIndustryId())
                                .recordedAt(draft.getRecordedAt())
                                .createdAt(draft.getCreatedAt())
                                .scope(draft.getScope())
                                .categoryId(draft.getCategoryId())
                                .customCategoryName(draft.getCustomCategoryName())
                                // New updates
                                .activityType(dto.getActivityType())
                                .activityQuantity(dto.getQuantity())
                                .activityUnit("TBD") // Will be updated to fuel unit
                                .emissionFactor(factor.getFactorValue())
                                .factorSource(factor.getSource())
                                .factorYear(factor.getYear())
                                .calculatedEmission(calculatedEmission)
                                .fuelType(dto.getFuelType())
                                .calorificValue(dto.getCalorificValue())
                                .build();

                return mapper.toResponse(emissionRepository.save(updated));
        }

        @Transactional
        @CacheEvict(value = "dashboard", allEntries = true)
        public EmissionResponseDTO commitDraft(UUID id) {
                EmissionRecord draft = emissionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Draft not found"));

                validateOwnership(draft);

                // Final validation before commit
                domainService.validateEmissionRecord(draft);

                EmissionRecord committed = EmissionRecord.builder()
                                .id(draft.getId())
                                .plantId(draft.getPlantId())
                                .scope(draft.getScope())
                                .categoryId(draft.getCategoryId())
                                .customCategoryName(draft.getCustomCategoryName())
                                .activityType(draft.getActivityType())
                                .activityQuantity(draft.getActivityQuantity())
                                .activityUnit(draft.getActivityUnit())
                                .emissionFactor(draft.getEmissionFactor())
                                .factorSource(draft.getFactorSource())
                                .factorYear(draft.getFactorYear())
                                .calculatedEmission(draft.getCalculatedEmission())
                                .department(draft.getDepartment())
                                .reportingFrequency(draft.getReportingFrequency())
                                .dataSource(draft.getDataSource())
                                .evidenceUrl(draft.getEvidenceUrl())
                                .responsiblePerson(draft.getResponsiblePerson())
                                .reportingPeriodStart(draft.getReportingPeriodStart())
                                .reportingPeriodEnd(draft.getReportingPeriodEnd())
                                .fuelType(draft.getFuelType())
                                .calorificValue(draft.getCalorificValue())
                                .tenantId(draft.getTenantId())
                                .industryId(draft.getIndustryId())
                                .recordedAt(draft.getRecordedAt())
                                .createdAt(draft.getCreatedAt())
                                // Commit updates
                                .status("COMMITTED")
                                .committedAt(Instant.now())
                                .build();

                EmissionRecord saved = emissionRepository.save(committed);

                UserPrincipal user = getUserPrincipal();
                auditService.logAction(
                                user.getTenantId(),
                                user.getUsername(),
                                "COMMIT_EMISSION_DRAFT",
                                "EMISSION_RECORD",
                                saved.getId().toString(),
                                "Committed draft to official ledger: " + saved.getCalculatedEmission() + " tCO2e");

                return mapper.toResponse(saved);
        }

        private UserPrincipal getUserPrincipal() {
                return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        }

        private void validateOwnership(EmissionRecord record) {
                UserPrincipal user = getUserPrincipal();
                if (!record.getTenantId().equals(user.getTenantId())) {
                        throw new RuntimeException("Access denied: You do not own this record.");
                }
        }
}
