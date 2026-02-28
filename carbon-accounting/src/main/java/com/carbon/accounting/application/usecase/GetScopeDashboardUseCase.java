package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.CategoryEmissionDTO;
import com.carbon.accounting.application.dto.EmissionRecordDetailDTO;
import com.carbon.accounting.application.dto.ScopeDashboardResponseDTO;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.infrastructure.security.UserPrincipal;
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

    public ScopeDashboardResponseDTO execute(String scope, Instant startDate, Instant endDate) {
        UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        UUID industryId = userPrincipal.getIndustryId();
        UUID tenantId = userPrincipal.getTenantId();

        if (industryId == null) {
            throw new IllegalStateException("User is not associated with any industry");
        }

        // Fetch records for the specific scope (In a real production app, the
        // repository should do the date filtering
        // directly in SQL for max performance. For phase 13, doing java-side filtering
        // or extending repo is acceptable,
        // but leveraging our newly added ByTenantAndScope is enough since we parse
        // dates here.)
        List<EmissionRecord> allEmissions = emissionRepository.findByTenantAndScope(tenantId, scope);

        // Filter by date (if provided)
        List<EmissionRecord> filteredEmissions = allEmissions.stream()
                .filter(e -> (startDate == null || !e.getRecordedAt().isBefore(startDate)))
                .filter(e -> (endDate == null || !e.getRecordedAt().isAfter(endDate)))
                .collect(Collectors.toList());

        // Calculate Total
        double totalEmission = filteredEmissions.stream()
                .mapToDouble(EmissionRecord::getTotalEmission)
                .sum();

        // Calculate Category Breakdown
        Map<String, Double> categoryTotals = filteredEmissions.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCustomCategoryName() != null ? e.getCustomCategoryName()
                                : (e.getCategoryId() != null ? e.getCategoryId().toString() : "Uncategorized"),
                        Collectors.summingDouble(EmissionRecord::getTotalEmission)));

        List<CategoryEmissionDTO> categoryBreakdown = categoryTotals.entrySet().stream()
                .map(entry -> CategoryEmissionDTO.builder()
                        .categoryId(null)
                        .categoryName(entry.getKey())
                        .totalEmission(entry.getValue())
                        .build())
                .collect(Collectors.toList());

        // Map to Record Details
        List<EmissionRecordDetailDTO> records = filteredEmissions.stream()
                .map(e -> EmissionRecordDetailDTO.builder()
                        .id(e.getId())
                        .category(e.getCustomCategoryName() != null ? e.getCustomCategoryName()
                                : (e.getCategoryId() != null ? e.getCategoryId().toString() : "Uncategorized"))
                        .value(e.getTotalEmission())
                        .recordedAt(e.getRecordedAt())
                        .build())
                .collect(Collectors.toList());

        return ScopeDashboardResponseDTO.builder()
                .scope(scope)
                .totalEmission(totalEmission)
                .categoryBreakdown(categoryBreakdown)
                .records(records)
                .build();
    }
}
