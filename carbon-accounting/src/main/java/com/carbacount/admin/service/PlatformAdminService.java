package com.carbacount.admin.service;

import com.carbacount.admin.dto.OrgEnterRequest;
import com.carbacount.admin.dto.OrgEnterResponse;
import com.carbacount.admin.dto.OrganizationSummaryDTO;
import com.carbacount.audit.service.AuditService;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.JwtUtils;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlatformAdminService {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AuditService auditService;

    /**
     * Returns a summary of all registered organizations for the ADMIN dashboard.
     */
    @Transactional(readOnly = true)
    public List<OrganizationSummaryDTO> getAllOrganizations() {
        List<Organization> organizations = organizationRepository.findAll();

        return organizations.stream().map(org -> {
            // Find the OWNER of the organization
            OrganizationUser ownerOrgUser = organizationUserRepository
                    .findByOrganizationIdAndRoleName(org.getId(), "OWNER")
                    .orElse(null);

            String ownerEmail = ownerOrgUser != null ? ownerOrgUser.getUser().getEmail() : "—";
            String ownerName = ownerOrgUser != null ? ownerOrgUser.getUser().getFullName() : "—";
            UUID ownerId = ownerOrgUser != null ? ownerOrgUser.getUser().getId() : null;

            return OrganizationSummaryDTO.builder()
                    .id(org.getId())
                    .name(org.getName())
                    .industryType(org.getIndustryType())
                    .country(org.getCountry())
                    .state(org.getState())
                    .createdAt(org.getCreatedAt())
                    .ownerEmail(ownerEmail)
                    .ownerName(ownerName)
                    .ownerId(ownerId)
                    .build();
        }).collect(Collectors.toList());
    }

    /**
     * Second-auth step: ADMIN provides the organization OWNER credentials.
     * If valid, returns an org-scoped JWT that grants OWNER-level access inside the
     * org.
     */
    @Transactional
    public OrgEnterResponse enterOrganization(UUID organizationId, OrgEnterRequest request) {
        // 1. Load the organization
        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        // 2. Validate the provided owner email exists and has OWNER role for this org
        User ownerUser = userRepository.findByEmail(request.getOwnerEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organizationId, ownerUser.getId())
                .orElseThrow(() -> new RuntimeException("User is not associated with this organization"));

        if (!"OWNER".equals(orgUser.getRole().getName())) {
            throw new RuntimeException("Provided user is not the OWNER of this organization");
        }

        // 3. Validate password
        if (!passwordEncoder.matches(request.getOwnerPassword(), ownerUser.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 4. Get the current admin principal from security context
        UserPrincipal adminPrincipal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();

        // 5. Generate org-scoped JWT
        String orgScopedToken = jwtUtils.generateOrgScopedJwt(
                adminPrincipal.getEmail(),
                adminPrincipal.getId(),
                organizationId,
                ownerUser.getId());

        // 6. Audit log
        auditService.log(org, ownerUser,
                "ADMIN_ENTERED_ORGANIZATION: " + adminPrincipal.getEmail(),
                "PLATFORM_ADMIN");

        return OrgEnterResponse.builder()
                .orgScopedToken(orgScopedToken)
                .organizationId(organizationId.toString())
                .organizationName(org.getName())
                .build();
    }
}
