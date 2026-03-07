package com.carbacount.owner.service;

import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.owner.dto.OwnerOrganizationSettingsRequest;
import com.carbacount.owner.dto.OwnerOrganizationSettingsResponse;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OwnerOrganizationSettingsService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationUserRepository organizationUserRepository;

    @Transactional(readOnly = true)
    public OwnerOrganizationSettingsResponse getSettings() {
        Organization organization = currentOrganization();
        OrganizationUser ownerMembership = organizationUserRepository
                .findByOrganizationIdAndRoleName(organization.getId(), "OWNER")
                .orElse(null);

        return OwnerOrganizationSettingsResponse.builder()
                .organizationId(organization.getId())
                .legalCompanyName(organization.getName())
                .industryType(organization.getIndustryType())
                .country(organization.getCountry())
                .state(organization.getState())
                .city(organization.getCity())
                .registeredAddress(organization.getRegisteredAddress())
                .contactEmail(organization.getContactEmail())
                .contactPhone(organization.getContactPhone())
                .netZeroTargetYear(organization.getNetZeroTargetYear())
                .reportingBoundary(organization.getReportingStandard())
                .ownerName(ownerMembership != null ? ownerMembership.getUser().getFullName() : null)
                .ownerEmail(ownerMembership != null ? ownerMembership.getUser().getEmail() : null)
                .build();
    }

    @Transactional
    public OwnerOrganizationSettingsResponse updateSettings(OwnerOrganizationSettingsRequest request) {
        Organization organization = currentOrganization();

        if (request.getLegalCompanyName() == null || request.getLegalCompanyName().isBlank()) {
            throw new IllegalArgumentException("Legal company name is required");
        }
        if (request.getIndustryType() == null || request.getIndustryType().isBlank()) {
            throw new IllegalArgumentException("Industry type is required");
        }
        if (request.getCountry() == null || request.getCountry().isBlank()) {
            throw new IllegalArgumentException("Country is required");
        }

        organization.setName(request.getLegalCompanyName().trim());
        organization.setIndustryType(request.getIndustryType().trim());
        organization.setCountry(request.getCountry().trim());
        organization.setState(trimOrNull(request.getState()));
        organization.setCity(trimOrNull(request.getCity()));
        organization.setRegisteredAddress(trimOrNull(request.getRegisteredAddress()));
        organization.setContactEmail(trimOrNull(request.getContactEmail()));
        organization.setContactPhone(trimOrNull(request.getContactPhone()));
        organization.setNetZeroTargetYear(request.getNetZeroTargetYear());
        organization.setReportingStandard(trimOrNull(request.getReportingBoundary()));
        organizationRepository.save(organization);

        return getSettings();
    }

    private Organization currentOrganization() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal.isOrgScoped() && principal.getOrganizationId() != null) {
            return organizationRepository.findById(principal.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found for org-scoped token"));
        }

        User currentUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));

        return organizationUserRepository.findByUser(currentUser).stream()
                .findFirst()
                .map(OrganizationUser::getOrganization)
                .orElseThrow(() -> new RuntimeException("Organization not found for current user"));
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
