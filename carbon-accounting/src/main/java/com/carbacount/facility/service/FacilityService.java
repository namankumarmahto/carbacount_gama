package com.carbacount.facility.service;

import com.carbacount.common.exception.FacilityAccessDeniedException;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.facility.repository.FacilityUserMappingRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityUserMappingRepository facilityUserMappingRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    // ── Helpers ────────────────────────────────────────────────────────────

    private UserPrincipal currentPrincipal() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private boolean isOwnerOrAdmin(UserPrincipal principal) {
        return principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    /**
     * Resolves the organization ID for any user.
     *
     * For DATA_ENTRY / VIEWER / AUDITOR users: the principal already carries
     * organizationId (set by CustomUserDetailsService at login time), so we
     * return it directly.
     *
     * Falls back to a DB lookup if organizationId is null (e.g. platform ADMIN
     * before entering an org).
     */
    public UUID resolveOrganizationIdForUser(UUID userId) {
        UserPrincipal principal = currentPrincipal();
        // Fast path: organizationId is already embedded in the JWT principal
        if (principal.getOrganizationId() != null) {
            return principal.getOrganizationId();
        }
        // Slow path: look it up from organization_users (fallback)
        return organizationUserRepository.findByUserId(userId).stream()
                .findFirst()
                .map(ou -> ou.getOrganization().getId())
                .orElseThrow(() -> new RuntimeException("No organization found for user: " + userId));
    }

    // ── Assigned facility IDs (DATA_ENTRY) ────────────────────────────────

    /**
     * Returns facility IDs explicitly assigned to this user via
     * facility_user_mapping.
     * Uses a JPQL projection query to avoid lazy-loading Facility entities.
     */
    @Transactional(readOnly = true)
    public List<UUID> getAssignedFacilityIds(UUID userId) {
        return facilityUserMappingRepository.findFacilityIdsByUserId(userId);
    }

    // ── Accessible Facilities ──────────────────────────────────────────────

    /**
     * Returns the facilities accessible for the currently authenticated user.
     * <ul>
     * <li>OWNER / ADMIN → all facilities belonging to their organization.</li>
     * <li>DATA_ENTRY → only facilities explicitly assigned via
     * facility_user_mapping.</li>
     * </ul>
     */
    @Transactional(readOnly = true)
    public List<Facility> getAccessibleFacilities(UUID organizationId) {
        UserPrincipal principal = currentPrincipal();

        if (isOwnerOrAdmin(principal)) {
            return facilityRepository.findByOrganizationId(organizationId);
        }

        // DATA_ENTRY: use direct-ID JPQL query (no lazy loading)
        List<UUID> assignedIds = facilityUserMappingRepository.findFacilityIdsByUserId(principal.getId());

        if (assignedIds.isEmpty()) {
            return List.of();
        }

        // Fetch all assigned facilities and restrict to the user's own org
        // (extra guard against cross-tenant data leakage)
        return facilityRepository.findAllById(assignedIds).stream()
                .filter(f -> organizationId == null || f.getOrganization().getId().equals(organizationId))
                .collect(Collectors.toList());
    }

    // ── Access check ───────────────────────────────────────────────────────

    /**
     * Returns {@code true} if the current user may read / submit data for the
     * given facility.
     */
    @Transactional(readOnly = true)
    public boolean canAccessFacility(UUID facilityId) {
        UserPrincipal principal = currentPrincipal();

        if (isOwnerOrAdmin(principal)) {
            // Verify the facility belongs to the user's organization
            UUID userOrgId = resolveOrganizationIdForUser(principal.getId());
            return facilityRepository.findById(facilityId)
                    .map(f -> f.getOrganization().getId().equals(userOrgId))
                    .orElse(false);
        }

        // DATA_ENTRY: check facility_user_mapping directly
        return facilityUserMappingRepository.existsByFacilityIdAndUserId(facilityId, principal.getId());
    }

    /**
     * Throws {@link FacilityAccessDeniedException} (HTTP 403) when the current
     * user is not allowed to access the given facility.
     */
    public void assertCanAccessFacility(UUID facilityId) {
        if (!canAccessFacility(facilityId)) {
            throw new FacilityAccessDeniedException(facilityId.toString());
        }
    }
}
