package com.carbacount.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOrganizationSettingsResponse {
    private UUID organizationId;
    private String legalCompanyName;
    private String industryType;
    private String country;
    private String state;
    private String city;
    private String registeredAddress;
    private String contactEmail;
    private String contactPhone;
    private Integer netZeroTargetYear;
    private String reportingBoundary;
    private String ownerName;
    private String ownerEmail;
}
