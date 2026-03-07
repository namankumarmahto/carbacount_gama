package com.carbacount.emissions.service;

import com.carbacount.emissions.dto.EmissionFactorOptionsResponse;
import com.carbacount.emissions.dto.EmissionFactorValueResponse;
import com.carbacount.emissions.entity.EmissionFactor;
import com.carbacount.emissions.repository.EmissionFactorRepository;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmissionFactorLookupService {

    private final EmissionFactorRepository emissionFactorRepository;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationUserRepository organizationUserRepository;

    @Transactional(readOnly = true)
    public EmissionFactorOptionsResponse getOptions(String scope, String industryOverride) {
        String normalizedScope = normalizeScope(scope);
        String industry = resolveIndustry(industryOverride);

        List<String> activityTypes = emissionFactorRepository
                .findDistinctActivityTypesForScopeAndIndustry(normalizedScope, industry);
        List<String> sources = emissionFactorRepository
                .findDistinctSourcesForScopeAndIndustry(normalizedScope, industry);

        List<EmissionFactor> rows = emissionFactorRepository.findAllByScopeAndIndustry(normalizedScope, industry);
        Map<String, EmissionFactorOptionsResponse.OptionRow> uniqueRows = new LinkedHashMap<>();
        for (EmissionFactor row : rows) {
            String key = safe(row.getActivityType()) + "|" + safe(row.getSourceName()) + "|" + safe(row.getUnit());
            uniqueRows.putIfAbsent(key, EmissionFactorOptionsResponse.OptionRow.builder()
                    .activityType(row.getActivityType())
                    .source(row.getSourceName())
                    .unit(row.getUnit())
                    .factorValue(row.getFactorValue())
                    .factorUnit(row.getUnitOfFactor())
                    .year(row.getFactorYear())
                    .build());
        }

        return EmissionFactorOptionsResponse.builder()
                .scope(normalizedScope)
                .industry(industry)
                .activityTypes(activityTypes)
                .sources(sources)
                .options(new ArrayList<>(uniqueRows.values()))
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> getUnits(String scope, String source, String industryOverride) {
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("source is required");
        }
        String industry = resolveIndustry(industryOverride);
        if (scope == null || scope.isBlank()) {
            return emissionFactorRepository.findDistinctUnitsForSourceAcrossScopes(source.trim(), industry);
        }
        String normalizedScope = normalizeScope(scope);
        return emissionFactorRepository.findDistinctUnitsForSource(normalizedScope, source.trim(), industry);
    }

    @Transactional(readOnly = true)
    public EmissionFactorValueResponse getFactor(String scope,
                                                 String source,
                                                 String unit,
                                                 String activityType,
                                                 String country,
                                                 String industryOverride) {
        if (source == null || source.isBlank()) {
            throw new IllegalArgumentException("source is required");
        }
        if (unit == null || unit.isBlank()) {
            throw new IllegalArgumentException("unit is required");
        }

        String industry = resolveIndustry(industryOverride);
        List<EmissionFactor> matches;
        String normalizedScope = null;
        if (scope == null || scope.isBlank()) {
            matches = emissionFactorRepository.findLatestFactorCandidatesAcrossScopes(
                    source.trim(),
                    unit.trim(),
                    activityType == null ? null : activityType.trim(),
                    country == null ? null : country.trim(),
                    industry
            );
        } else {
            normalizedScope = normalizeScope(scope);
            matches = emissionFactorRepository.findLatestFactorCandidates(
                    normalizedScope,
                    source.trim(),
                    unit.trim(),
                    activityType == null ? null : activityType.trim(),
                    country == null ? null : country.trim(),
                    industry
            );
        }

        EmissionFactor factor = matches.stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Emission factor not found for selected source/unit"));

        return EmissionFactorValueResponse.builder()
                .scope(normalizedScope != null ? normalizedScope : factor.getScopeType())
                .industry(industry)
                .activityType(factor.getActivityType())
                .source(factor.getSourceName())
                .unit(factor.getUnit())
                .factorValue(factor.getFactorValue())
                .factorUnit(factor.getUnitOfFactor())
                .year(factor.getFactorYear())
                .build();
    }

    private String normalizeScope(String scope) {
        if (scope == null || scope.isBlank()) {
            throw new IllegalArgumentException("scope is required");
        }
        return scope.trim().toUpperCase();
    }

    private String resolveIndustry(String industryOverride) {
        if (industryOverride != null && !industryOverride.isBlank()) {
            return industryOverride.trim();
        }

        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.isOrgScoped() && principal.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(principal.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found for org-scoped token"));
            return org.getIndustryType();
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return organizationUserRepository.findByUserId(user.getId()).stream()
                .findFirst()
                .map(ou -> ou.getOrganization().getIndustryType())
                .orElse("ALL");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
