package com.carbacount.owner.service;

import com.carbacount.emissions.entity.DataEntrySubmission;
import com.carbacount.emissions.repository.DataEntrySubmissionRepository;
import com.carbacount.emissions.repository.ProductionDataRepository;
import com.carbacount.emissions.repository.Scope1Repository;
import com.carbacount.emissions.repository.Scope2Repository;
import com.carbacount.emissions.repository.Scope3ActivityRepository;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.entity.FacilityUserMapping;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.facility.repository.FacilityUserMappingRepository;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.owner.dto.OwnerDashboardResponse;
import com.carbacount.reporting.entity.ReportingYear;
import com.carbacount.reporting.repository.ReportingYearRepository;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OwnerDashboardService {

    private static final List<String> VALID_STATUSES = List.of("VERIFIED");
    private static final Set<String> REQUIRED_SCOPES = Set.of("SCOPE1", "SCOPE2", "SCOPE3");

    private final Scope1Repository scope1Repository;
    private final Scope2Repository scope2Repository;
    private final Scope3ActivityRepository scope3Repository;
    private final ProductionDataRepository productionDataRepository;
    private final FacilityRepository facilityRepository;
    private final FacilityUserMappingRepository facilityUserMappingRepository;
    private final DataEntrySubmissionRepository submissionRepository;
    private final ReportingYearRepository reportingYearRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationUserRepository organizationUserRepository;

    @Transactional(readOnly = true)
    public OwnerDashboardResponse getOwnerDashboard(UUID requestedReportingYearId) {
        Organization organization = currentOrganization();
        ReportingYear reportingYear = resolveReportingYearOrNull(organization.getId(), requestedReportingYearId);
        if (reportingYear == null) {
            return OwnerDashboardResponse.builder()
                    .reportingYearId(null)
                    .reportingYear("N/A")
                    .totalEmissions(BigDecimal.ZERO)
                    .scope1Emissions(BigDecimal.ZERO)
                    .scope2Emissions(BigDecimal.ZERO)
                    .scope3Emissions(BigDecimal.ZERO)
                    .facilityEmissionDistribution(List.of())
                    .facilityStatusList(List.of())
                    .carbonIntensity(BigDecimal.ZERO)
                    .netZeroProgress(OwnerDashboardResponse.NetZeroProgress.builder()
                            .targetYear(organization.getNetZeroTargetYear())
                            .progressPercentage(BigDecimal.ZERO)
                            .baselineEmissions(BigDecimal.ZERO)
                            .currentEmissions(BigDecimal.ZERO)
                            .build())
                    .complianceStatus(OwnerDashboardResponse.ComplianceStatus.builder()
                            .brsr("In Progress")
                            .ghgProtocol("In Progress")
                            .iso14064("In Progress")
                            .build())
                    .build();
        }

        BigDecimal scope1 = zero(scope1Repository.sumCalculatedEmission(organization.getId(), reportingYear.getId(), VALID_STATUSES));
        BigDecimal scope2 = zero(scope2Repository.sumCalculatedEmission(organization.getId(), reportingYear.getId(), VALID_STATUSES));
        BigDecimal scope3 = zero(scope3Repository.sumCalculatedEmission(organization.getId(), reportingYear.getId(), VALID_STATUSES));
        BigDecimal total = scope1.add(scope2).add(scope3);

        BigDecimal totalProduction = zero(productionDataRepository.sumTotalProduction(
                organization.getId(), reportingYear.getId(), VALID_STATUSES));
        BigDecimal carbonIntensity = totalProduction.compareTo(BigDecimal.ZERO) > 0
                ? total.divide(totalProduction, 6, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<OwnerDashboardResponse.FacilityEmissionDistribution> facilityDistribution = buildFacilityDistribution(
                organization.getId(), reportingYear.getId(), total);

        List<OwnerDashboardResponse.FacilityStatusItem> facilityStatus = buildFacilityStatus(
                organization.getId(), reportingYear);

        OwnerDashboardResponse.NetZeroProgress netZeroProgress = buildNetZeroProgress(
                organization, reportingYear, total);

        OwnerDashboardResponse.ComplianceStatus complianceStatus = buildComplianceStatus(
                organization.getId(), reportingYear.getId(), scope1, scope2, scope3);

        return OwnerDashboardResponse.builder()
                .reportingYearId(reportingYear.getId())
                .reportingYear(reportingYear.getYearLabel())
                .totalEmissions(total)
                .scope1Emissions(scope1)
                .scope2Emissions(scope2)
                .scope3Emissions(scope3)
                .facilityEmissionDistribution(facilityDistribution)
                .facilityStatusList(facilityStatus)
                .carbonIntensity(carbonIntensity)
                .netZeroProgress(netZeroProgress)
                .complianceStatus(complianceStatus)
                .build();
    }

    private OwnerDashboardResponse.NetZeroProgress buildNetZeroProgress(
            Organization organization, ReportingYear currentYear, BigDecimal currentEmission) {
        List<ReportingYear> years = reportingYearRepository.findByOrganizationId(organization.getId()).stream()
                .sorted(Comparator.comparing(ReportingYear::getStartDate))
                .toList();

        BigDecimal baseline = currentEmission;
        for (ReportingYear year : years) {
            BigDecimal total = totalEmissionForYear(organization.getId(), year.getId());
            if (total.compareTo(BigDecimal.ZERO) > 0) {
                baseline = total;
                break;
            }
        }

        BigDecimal progress = BigDecimal.ZERO;
        if (baseline.compareTo(BigDecimal.ZERO) > 0) {
            progress = baseline.subtract(currentEmission)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(baseline, 2, RoundingMode.HALF_UP);
            if (progress.compareTo(BigDecimal.ZERO) < 0) {
                progress = BigDecimal.ZERO;
            }
            if (progress.compareTo(BigDecimal.valueOf(100)) > 0) {
                progress = BigDecimal.valueOf(100);
            }
        }

        return OwnerDashboardResponse.NetZeroProgress.builder()
                .targetYear(organization.getNetZeroTargetYear())
                .progressPercentage(progress)
                .baselineEmissions(baseline)
                .currentEmissions(currentEmission)
                .build();
    }

    private OwnerDashboardResponse.ComplianceStatus buildComplianceStatus(
            UUID organizationId, UUID reportingYearId, BigDecimal scope1, BigDecimal scope2, BigDecimal scope3) {
        boolean brsrCompliant = scope1.compareTo(BigDecimal.ZERO) > 0
                && scope2.compareTo(BigDecimal.ZERO) > 0
                && scope3.compareTo(BigDecimal.ZERO) > 0;

        long totalRows = scope1Repository.countByFacilityOrganizationIdAndReportingYearId(organizationId, reportingYearId)
                + scope2Repository.countByFacilityOrganizationIdAndReportingYearId(organizationId, reportingYearId)
                + scope3Repository.countByFacilityOrganizationIdAndReportingYearId(organizationId, reportingYearId);

        long verifiedRows = scope1Repository.countByFacilityOrganizationIdAndReportingYearIdAndStatus(organizationId, reportingYearId, "VERIFIED")
                + scope2Repository.countByFacilityOrganizationIdAndReportingYearIdAndStatus(organizationId, reportingYearId, "VERIFIED")
                + scope3Repository.countByFacilityOrganizationIdAndReportingYearIdAndStatus(organizationId, reportingYearId, "VERIFIED");

        long factorAppliedRows = scope1Repository.countByFacilityOrganizationIdAndReportingYearIdAndEmissionFactorIsNotNullAndCalculatedEmissionIsNotNull(organizationId, reportingYearId)
                + scope2Repository.countByFacilityOrganizationIdAndReportingYearIdAndEmissionFactorIsNotNullAndCalculatedEmissionIsNotNull(organizationId, reportingYearId)
                + scope3Repository.countByFacilityOrganizationIdAndReportingYearIdAndEmissionFactorIsNotNullAndCalculatedEmissionIsNotNull(organizationId, reportingYearId);

        boolean ghgCompliant = totalRows > 0 && verifiedRows == totalRows && factorAppliedRows == totalRows;
        boolean isoCompliant = totalRows > 0 && verifiedRows == totalRows;

        return OwnerDashboardResponse.ComplianceStatus.builder()
                .brsr(brsrCompliant ? "Compliant" : "In Progress")
                .ghgProtocol(ghgCompliant ? "Compliant" : "In Progress")
                .iso14064(isoCompliant ? "Compliant" : "In Progress")
                .build();
    }

    private List<OwnerDashboardResponse.FacilityStatusItem> buildFacilityStatus(UUID organizationId, ReportingYear reportingYear) {
        List<Facility> facilities = facilityRepository.findByOrganizationId(organizationId);
        List<DataEntrySubmission> submissions = submissionRepository.findByOrganizationIdAndReportingYearId(organizationId, reportingYear.getId());
        Map<UUID, List<DataEntrySubmission>> submissionsByFacility = submissions.stream()
                .collect(Collectors.groupingBy(s -> s.getFacility().getId()));

        Map<UUID, String> assignedUsers = resolveAssignedUsers(facilities);

        return facilities.stream()
                .map(facility -> {
                    List<DataEntrySubmission> facilitySubmissions = submissionsByFacility.getOrDefault(facility.getId(), List.of());
                    Set<String> reportedScopes = facilitySubmissions.stream()
                            .map(DataEntrySubmission::getScopeType)
                            .filter(REQUIRED_SCOPES::contains)
                            .collect(Collectors.toSet());
                    Set<String> verifiedScopes = facilitySubmissions.stream()
                            .filter(s -> "VERIFIED".equals(s.getReviewStatus()))
                            .map(DataEntrySubmission::getScopeType)
                            .filter(REQUIRED_SCOPES::contains)
                            .collect(Collectors.toSet());

                    String status;
                    if (reportedScopes.isEmpty()) {
                        status = "Pending";
                    } else if (verifiedScopes.containsAll(REQUIRED_SCOPES)) {
                        status = "Complete";
                    } else {
                        status = "In Progress";
                    }

                    LocalDateTime lastUpdated = facilitySubmissions.stream()
                            .map(s -> firstNonNull(s.getUpdatedAt(), s.getSubmittedAt(), s.getCreatedAt()))
                            .filter(Objects::nonNull)
                            .max(LocalDateTime::compareTo)
                            .orElse(null);

                    return OwnerDashboardResponse.FacilityStatusItem.builder()
                            .facilityId(facility.getId())
                            .facilityName(facility.getName())
                            .location(formatLocation(facility))
                            .reportingYear(reportingYear.getYearLabel())
                            .dataStatus(status)
                            .lastUpdatedTimestamp(lastUpdated)
                            .assignedUser(assignedUsers.getOrDefault(facility.getId(), "Unassigned"))
                            .build();
                })
                .toList();
    }

    private Map<UUID, String> resolveAssignedUsers(List<Facility> facilities) {
        if (facilities.isEmpty()) {
            return Map.of();
        }
        List<UUID> facilityIds = facilities.stream().map(Facility::getId).toList();
        return facilityUserMappingRepository.findByFacilityIdInWithUser(facilityIds).stream()
                .collect(Collectors.toMap(
                        m -> m.getFacility().getId(),
                        m -> m.getUser().getFullName(),
                        (a, b) -> a));
    }

    private List<OwnerDashboardResponse.FacilityEmissionDistribution> buildFacilityDistribution(
            UUID organizationId, UUID reportingYearId, BigDecimal total) {
        Map<UUID, TempFacilityEmission> byFacility = new LinkedHashMap<>();
        mergeFacilityEmission(byFacility, scope1Repository.sumCalculatedEmissionByFacility(organizationId, reportingYearId, VALID_STATUSES));
        mergeFacilityEmission(byFacility, scope2Repository.sumCalculatedEmissionByFacility(organizationId, reportingYearId, VALID_STATUSES));
        mergeFacilityEmission(byFacility, scope3Repository.sumCalculatedEmissionByFacility(organizationId, reportingYearId, VALID_STATUSES));

        return byFacility.values().stream()
                .map(item -> OwnerDashboardResponse.FacilityEmissionDistribution.builder()
                        .facilityId(item.facilityId)
                        .facilityName(item.facilityName)
                        .emissions(item.emissions)
                        .percentage(total.compareTo(BigDecimal.ZERO) > 0
                                ? item.emissions.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO)
                        .build())
                .sorted(Comparator.comparing(OwnerDashboardResponse.FacilityEmissionDistribution::getEmissions).reversed())
                .toList();
    }

    private void mergeFacilityEmission(Map<UUID, TempFacilityEmission> byFacility, List<Object[]> rows) {
        for (Object[] row : rows) {
            UUID facilityId = (UUID) row[0];
            String facilityName = (String) row[1];
            BigDecimal emission = zero((BigDecimal) row[2]);
            byFacility.compute(facilityId, (k, v) -> {
                if (v == null) {
                    return new TempFacilityEmission(facilityId, facilityName, emission);
                }
                v.emissions = v.emissions.add(emission);
                return v;
            });
        }
    }

    private BigDecimal totalEmissionForYear(UUID organizationId, UUID reportingYearId) {
        BigDecimal s1 = zero(scope1Repository.sumCalculatedEmission(organizationId, reportingYearId, VALID_STATUSES));
        BigDecimal s2 = zero(scope2Repository.sumCalculatedEmission(organizationId, reportingYearId, VALID_STATUSES));
        BigDecimal s3 = zero(scope3Repository.sumCalculatedEmission(organizationId, reportingYearId, VALID_STATUSES));
        return s1.add(s2).add(s3);
    }

    private ReportingYear resolveReportingYearOrNull(UUID organizationId, UUID requestedReportingYearId) {
        if (requestedReportingYearId != null) {
            ReportingYear reportingYear = reportingYearRepository.findById(requestedReportingYearId)
                    .orElseThrow(() -> new RuntimeException("Reporting year not found"));
            if (!reportingYear.getOrganization().getId().equals(organizationId)) {
                throw new RuntimeException("Reporting year does not belong to your organization");
            }
            return reportingYear;
        }
        return reportingYearRepository.findFirstByOrganizationIdOrderByStartDateDesc(organizationId)
                .orElse(null);
    }

    private Organization currentOrganization() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.isOrgScoped() && principal.getOrganizationId() != null) {
            return organizationRepository.findById(principal.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found"));
        }
        return organizationUserRepository.findByUserId(principal.getId()).stream()
                .findFirst()
                .map(ou -> ou.getOrganization())
                .orElseThrow(() -> new RuntimeException("Organization not found for user"));
    }

    private String formatLocation(Facility facility) {
        return List.of(facility.getCity(), facility.getState(), facility.getCountry()).stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));
    }

    @SafeVarargs
    private final <T> T firstNonNull(T... values) {
        for (T value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private BigDecimal zero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static class TempFacilityEmission {
        UUID facilityId;
        String facilityName;
        BigDecimal emissions;

        TempFacilityEmission(UUID facilityId, String facilityName, BigDecimal emissions) {
            this.facilityId = facilityId;
            this.facilityName = facilityName;
            this.emissions = emissions;
        }
    }
}
