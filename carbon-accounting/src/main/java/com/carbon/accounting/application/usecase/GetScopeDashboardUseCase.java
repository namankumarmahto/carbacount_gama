package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.CategoryEmissionDTO;
import com.carbon.accounting.application.dto.EmissionRecordDetailDTO;
import com.carbon.accounting.application.dto.ScopeDashboardResponseDTO;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
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
public class GetScopeDashboardUseCase {

        private final EmissionRepository emissionRepository;
        private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataEmissionCategoryRepository categoryRepository;

        public ScopeDashboardResponseDTO execute(String scope, Instant startDate, Instant endDate) {
                UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID industryId = userPrincipal.getIndustryId();
                UUID tenantId = userPrincipal.getTenantId();

                if (industryId == null) {
                        throw new IllegalStateException("User is not associated with any industry");
                }

                // Fetch COMMITTED records for the specific scope
                List<EmissionRecord> allEmissions = emissionRepository.findByTenantAndScopeAndStatus(tenantId, scope,
                                "COMMITTED");

                // Filter by date (if provided)
                List<EmissionRecord> filteredEmissions = allEmissions.stream()
                                .filter(e -> (startDate == null || !e.getRecordedAt().isBefore(startDate)))
                                .filter(e -> (endDate == null || !e.getRecordedAt().isAfter(endDate)))
                                .collect(Collectors.toList());

                // Calculate Total
                double totalEmission = filteredEmissions.stream()
                                .mapToDouble(EmissionRecord::getCalculatedEmission)
                                .sum();

                // Pre-fetch category names for this industry type and scope
                Map<UUID, String> categoryNameMap = categoryRepository
                                .findByIndustryTypeIdAndScope(userPrincipal.getIndustryTypeId(), scope)
                                .stream()
                                .collect(Collectors.toMap(
                                                com.carbon.accounting.infrastructure.persistence.entity.EmissionCategoryEntity::getId,
                                                com.carbon.accounting.infrastructure.persistence.entity.EmissionCategoryEntity::getCategoryName));

                // Calculate Category Breakdown
                Map<String, Double> categoryTotals = filteredEmissions.stream()
                                .collect(Collectors.groupingBy(
                                                e -> e.getCustomCategoryName() != null ? e.getCustomCategoryName()
                                                                : (e.getCategoryId() != null
                                                                                ? categoryNameMap.getOrDefault(
                                                                                                e.getCategoryId(),
                                                                                                "Unknown Category")
                                                                                : "Uncategorized"),
                                                Collectors.summingDouble(EmissionRecord::getCalculatedEmission)));

                List<CategoryEmissionDTO> categoryBreakdown = categoryTotals.entrySet().stream()
                                .map(entry -> CategoryEmissionDTO.builder()
                                                .categoryId(null)
                                                .categoryName(entry.getKey())
                                                .totalEmission(entry.getValue())
                                                .build())
                                .collect(Collectors.toList());

                // Map to Record Details
                List<EmissionRecordDetailDTO> records = filteredEmissions.stream()
                                .map(e -> {
                                        String catName = e.getCustomCategoryName() != null ? e.getCustomCategoryName()
                                                        : (e.getCategoryId() != null
                                                                        ? categoryNameMap.getOrDefault(
                                                                                        e.getCategoryId(),
                                                                                        "Unknown Category")
                                                                        : "Uncategorized");
                                        return EmissionRecordDetailDTO.builder()
                                                        .id(e.getId())
                                                        .category(catName)
                                                        .activityType(e.getActivityType())
                                                        .activityQuantity(e.getActivityQuantity())
                                                        .activityUnit(e.getActivityUnit())
                                                        .value(e.getCalculatedEmission())
                                                        .recordedAt(e.getRecordedAt())
                                                        .build();
                                })
                                .collect(Collectors.toList());

                return ScopeDashboardResponseDTO.builder()
                                .scope(scope)
                                .totalEmission(totalEmission)
                                .categoryBreakdown(categoryBreakdown)
                                .records(records)
                                .build();
        }
}
