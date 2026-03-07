package com.carbacount.owner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerOrganizationSettingsRequest {
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
}
