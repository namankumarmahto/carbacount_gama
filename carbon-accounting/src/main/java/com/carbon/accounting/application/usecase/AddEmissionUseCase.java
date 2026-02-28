package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.application.dto.EmissionResponseDTO;
import com.carbon.accounting.application.mapper.EmissionApplicationMapper;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.domain.service.EmissionDomainService;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.core.repository.PlantRepository;
import com.carbon.accounting.application.exception.PlantNotFoundException;
import com.carbon.accounting.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AddEmissionUseCase {

        private final EmissionRepository emissionRepository;
        private final PlantRepository plantRepository;
        private final EmissionDomainService domainService;
        private final EmissionApplicationMapper mapper;
        private final com.carbon.accounting.core.domain.service.AuditService auditService;

        @Transactional
        @CacheEvict(value = "dashboard", allEntries = true)
        public EmissionResponseDTO execute(AddEmissionRequestDTO request) {
                // Validate plant existence
                plantRepository.findById(request.getPlantId())
                                .orElseThrow(() -> new PlantNotFoundException(
                                                "Plant with ID " + request.getPlantId() + " not found"));

                // Convert DTO to domain
                EmissionRecord domainModel = mapper.toDomain(request);

                // Set tenantId from security context
                UserPrincipal userPrincipal = (UserPrincipal) org.springframework.security.core.context.SecurityContextHolder
                                .getContext().getAuthentication().getPrincipal();
                domainModel = EmissionRecord.builder()
                                .id(domainModel.getId())
                                .plantId(domainModel.getPlantId())
                                .scope(domainModel.getScope())
                                .categoryId(domainModel.getCategoryId())
                                .customCategoryName(domainModel.getCustomCategoryName())
                                .totalEmission(domainModel.getTotalEmission())
                                .tenantId(userPrincipal.getTenantId())
                                .recordedAt(domainModel.getRecordedAt())
                                .createdAt(domainModel.getCreatedAt())
                                .build();

                // Domain validation
                domainService.validateEmissionRecord(domainModel);

                // Save
                EmissionRecord savedRecord = emissionRepository.save(domainModel);

                // Log audit action
                auditService.logAction(
                                userPrincipal.getTenantId(),
                                userPrincipal.getUsername(),
                                "CREATE_EMISSION",
                                "EMISSION_RECORD",
                                savedRecord.getId().toString(),
                                "Added emission record for plant: " + request.getPlantId());

                // Return response
                return mapper.toResponse(savedRecord);
        }
}
