package com.carbacount.admin.controller;

import com.carbacount.admin.dto.OrgEnterRequest;
import com.carbacount.admin.dto.OrgEnterResponse;
import com.carbacount.admin.dto.OrganizationSummaryDTO;
import com.carbacount.admin.service.PlatformAdminService;
import com.carbacount.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Platform-level endpoints accessible ONLY by the seeded ADMIN account.
 * These endpoints operate above the organization level.
 */
@RestController
@RequestMapping("/api/platform")
@PreAuthorize("hasRole('ADMIN')")
public class PlatformAdminController {

    @Autowired
    private PlatformAdminService platformAdminService;

    /**
     * Step 4: List all registered organizations for the ADMIN dashboard.
     * Returns organization name, industry type, country, registration date, owner
     * email.
     */
    @GetMapping("/organizations")
    public ResponseEntity<ApiResponse<List<OrganizationSummaryDTO>>> getAllOrganizations() {
        try {
            List<OrganizationSummaryDTO> orgs = platformAdminService.getAllOrganizations();
            return ResponseEntity.ok(new ApiResponse<>(true, "Organizations fetched successfully", orgs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to fetch organizations: " + e.getMessage(), null));
        }
    }

    /**
     * Step 5 & 6: Second-auth endpoint — ADMIN enters an organisation by providing
     * the owner's email + password. Returns an org-scoped JWT on success.
     */
    @PostMapping("/organizations/{orgId}/enter")
    public ResponseEntity<ApiResponse<OrgEnterResponse>> enterOrganization(
            @PathVariable UUID orgId,
            @Valid @RequestBody OrgEnterRequest request) {
        try {
            OrgEnterResponse response = platformAdminService.enterOrganization(orgId, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Organization access granted", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
