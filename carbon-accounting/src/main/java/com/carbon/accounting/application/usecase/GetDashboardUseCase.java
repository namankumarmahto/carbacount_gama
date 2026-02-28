package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.CategoryEmissionDTO;
import com.carbon.accounting.application.dto.DashboardResponseDTO;
import com.carbon.accounting.application.dto.MonthlyTrendDTO;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.domain.model.Plant;
import com.carbon.accounting.core.repository.EmissionRepository;
import com.carbon.accounting.core.repository.PlantRepository;
import com.carbon.accounting.infrastructure.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetDashboardUseCase {

        private final EmissionRepository emissionRepository;
        private final PlantRepository plantRepository;

        @Cacheable(value = "dashboard", key = "#industryId", condition = "#industryId != null")
        public DashboardResponseDTO execute() {
                // Extract industryId from authenticated user context
                UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();
                UUID industryId = userPrincipal.getIndustryId();
                UUID tenantId = userPrincipal.getTenantId();

                if (industryId == null) {
                        throw new IllegalStateException("User is not associated with any industry");
                }

                // Find all plants for industry
                List<Plant> plants = plantRepository.findByTenantAndIndustry(tenantId, industryId);

                // Get all emissions for these plants
                List<EmissionRecord> allEmissions = plants.stream()
                                .flatMap(plant -> emissionRepository.findByTenantAndPlant(tenantId, plant.getId())
                                                .stream())
                                .collect(Collectors.toList());

                // Calculate totals
                double totalScope1 = allEmissions.stream()
                                .filter(e -> "SCOPE1".equals(e.getScope()))
                                .mapToDouble(EmissionRecord::getTotalEmission)
                                .sum();
                double totalScope2 = allEmissions.stream()
                                .filter(e -> "SCOPE2".equals(e.getScope()))
                                .mapToDouble(EmissionRecord::getTotalEmission)
                                .sum();
                double totalScope3 = allEmissions.stream()
                                .filter(e -> "SCOPE3".equals(e.getScope()))
                                .mapToDouble(EmissionRecord::getTotalEmission)
                                .sum();
                double totalEmission = totalScope1 + totalScope2 + totalScope3;

                // Calculate monthly trends
                Map<String, Double> trendsMap = allEmissions.stream()
                                .collect(Collectors.groupingBy(
                                                e -> e.getRecordedAt().atZone(ZoneId.of("UTC")).getMonth()
                                                                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH),
                                                TreeMap::new,
                                                Collectors.summingDouble(EmissionRecord::getTotalEmission)));

                List<MonthlyTrendDTO> trends = trendsMap.entrySet().stream()
                                .map(entry -> MonthlyTrendDTO.builder()
                                                .month(entry.getKey())
                                                .emission(entry.getValue())
                                                .build())
                                .collect(Collectors.toList());

                // Calculate Category Breakdown
                Map<String, Double> categoryTotals = allEmissions.stream()
                                .collect(Collectors.groupingBy(
                                                e -> e.getCustomCategoryName() != null ? e.getCustomCategoryName()
                                                                : (e.getCategoryId() != null
                                                                                ? e.getCategoryId().toString()
                                                                                : "Uncategorized"),
                                                Collectors.summingDouble(EmissionRecord::getTotalEmission)));

                List<CategoryEmissionDTO> categoryBreakdown = categoryTotals.entrySet().stream()
                                .map(entry -> CategoryEmissionDTO.builder()
                                                .categoryId(null) // Not resolving real name for mapped ones here to
                                                                  // save complexity, frontend can resolve or we can
                                                                  // display UUID
                                                .categoryName(entry.getKey())
                                                .totalEmission(entry.getValue())
                                                .build())
                                .collect(Collectors.toList());

                return DashboardResponseDTO.builder()
                                .totalEmission(totalEmission)
                                .scope1Total(totalScope1)
                                .scope2Total(totalScope2)
                                .scope3Total(totalScope3)
                                .carbonIntensity(totalEmission > 0 ? totalEmission / 100.0 : 0.0)
                                .monthlyTrends(trends)
                                .categoryBreakdown(categoryBreakdown)
                                .build();
        }
}
