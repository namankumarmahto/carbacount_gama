package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.AllEmissionsResponseDTO;
import com.carbon.accounting.application.dto.EmissionRecordDetailDTO;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionCategoryEntity;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataEmissionCategoryRepository;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetAllEmissionsUseCase {

        private final EmissionRepository emissionRepository;
        private final SpringDataEmissionCategoryRepository categoryRepository;

        public AllEmissionsResponseDTO execute(Instant startDate, Instant endDate) {
                UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID tenantId = userPrincipal.getTenantId();
                UUID industryTypeId = userPrincipal.getIndustryTypeId();

                // Fetch all COMMITTED records for the tenant
                List<EmissionRecord> allEmissions = emissionRepository.findByTenantAndStatus(tenantId, "COMMITTED");

                // Filter by date
                List<EmissionRecord> filteredEmissions = allEmissions.stream()
                                .filter(e -> (startDate == null || !e.getRecordedAt().isBefore(startDate)))
                                .filter(e -> (endDate == null || !e.getRecordedAt().isAfter(endDate)))
                                .collect(Collectors.toList());

                // Calculate Total
                double totalEmission = filteredEmissions.stream()
                                .mapToDouble(EmissionRecord::getCalculatedEmission)
                                .sum();

                // Fetch all categories for this industry type to resolve names
                // Note: For "All Emissions", we don't filter categories by scope here because
                // we might have records from all scopes.
                // We'll fetch all categories for the industry type.
                Map<UUID, String> categoryNameMap = categoryRepository.findAll().stream()
                                .filter(c -> industryTypeId.equals(c.getIndustryTypeId()))
                                .collect(Collectors.toMap(EmissionCategoryEntity::getId,
                                                EmissionCategoryEntity::getCategoryName,
                                                (a, b) -> a));

                // Map to Record Details
                List<EmissionRecordDetailDTO> records = filteredEmissions.stream()
                                .map(e -> {
                                        String categoryName = e.getCustomCategoryName() != null
                                                        ? e.getCustomCategoryName()
                                                        : (e.getCategoryId() != null
                                                                        ? categoryNameMap.getOrDefault(
                                                                                        e.getCategoryId(),
                                                                                        "Unknown Category")
                                                                        : "Uncategorized");

                                        // Prefix category with Scope for better clarity in "All Records" view if
                                        // needed,
                                        // or let frontend handle scope column.
                                        return EmissionRecordDetailDTO.builder()
                                                        .id(e.getId())
                                                        .category(categoryName)
                                                        .activityType(e.getActivityType())
                                                        .activityQuantity(e.getActivityQuantity())
                                                        .activityUnit(e.getActivityUnit())
                                                        .value(e.getCalculatedEmission())
                                                        .recordedAt(e.getRecordedAt())
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return AllEmissionsResponseDTO.builder()
                                .totalEmission(totalEmission)
                                .records(records)
                                .build();
        }
}
