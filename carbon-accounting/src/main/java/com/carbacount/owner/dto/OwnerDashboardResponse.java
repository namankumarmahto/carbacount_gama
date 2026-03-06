package com.carbacount.owner.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardResponse {
    @JsonProperty("reporting_year_id")
    private UUID reportingYearId;

    @JsonProperty("reporting_year")
    private String reportingYear;

    @JsonProperty("total_emissions")
    private BigDecimal totalEmissions;

    @JsonProperty("scope1_emissions")
    private BigDecimal scope1Emissions;

    @JsonProperty("scope2_emissions")
    private BigDecimal scope2Emissions;

    @JsonProperty("scope3_emissions")
    private BigDecimal scope3Emissions;

    @JsonProperty("facility_emission_distribution")
    private List<FacilityEmissionDistribution> facilityEmissionDistribution;

    @JsonProperty("facility_status_list")
    private List<FacilityStatusItem> facilityStatusList;

    @JsonProperty("carbon_intensity")
    private BigDecimal carbonIntensity;

    @JsonProperty("net_zero_progress")
    private NetZeroProgress netZeroProgress;

    @JsonProperty("compliance_status")
    private ComplianceStatus complianceStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityEmissionDistribution {
        @JsonProperty("facility_id")
        private UUID facilityId;
        @JsonProperty("facility_name")
        private String facilityName;
        @JsonProperty("emissions")
        private BigDecimal emissions;
        @JsonProperty("percentage")
        private BigDecimal percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FacilityStatusItem {
        @JsonProperty("facility_id")
        private UUID facilityId;
        @JsonProperty("facility_name")
        private String facilityName;
        @JsonProperty("location")
        private String location;
        @JsonProperty("reporting_year")
        private String reportingYear;
        @JsonProperty("data_status")
        private String dataStatus;
        @JsonProperty("last_updated_timestamp")
        private LocalDateTime lastUpdatedTimestamp;
        @JsonProperty("assigned_user")
        private String assignedUser;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NetZeroProgress {
        @JsonProperty("target_year")
        private Integer targetYear;
        @JsonProperty("progress_percentage")
        private BigDecimal progressPercentage;
        @JsonProperty("baseline_emissions")
        private BigDecimal baselineEmissions;
        @JsonProperty("current_emissions")
        private BigDecimal currentEmissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplianceStatus {
        @JsonProperty("brsr")
        private String brsr;
        @JsonProperty("ghg_protocol")
        private String ghgProtocol;
        @JsonProperty("iso_14064")
        private String iso14064;
    }
}
