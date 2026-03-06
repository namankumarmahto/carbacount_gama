package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.reporting.entity.ReportingYear;
import com.carbacount.reporting.repository.ReportingYearRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;

/**
 * Manages reporting years (financial periods) for an organisation.
 * Accessible by OWNER, ADMIN, and DATA_ENTRY roles.
 */
@RestController
@RequestMapping("/api/reporting-years")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY')")
public class ReportingYearController {

    @Autowired
    private ReportingYearRepository reportingYearRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private OrganizationUserRepository orgUserRepo;

    // ── helpers ──────────────────────────────────────────────────────────────

    private User currentUser() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepo.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Organization currentOrg() {
        User user = currentUser();
        return orgUserRepo.findByUserId(user.getId()).stream()
                .findFirst()
                .map(OrganizationUser::getOrganization)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    private Map<String, Object> toMap(ReportingYear ry) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", ry.getId());
        m.put("yearLabel", ry.getYearLabel());
        m.put("startDate", ry.getStartDate().toString());
        m.put("endDate", ry.getEndDate().toString());
        m.put("isLocked", ry.isLocked());
        return m;
    }

    // ── GET /api/reporting-years ─────────────────────────────────────────────
    /**
     * Returns all reporting years for the current org.
     * If none exist yet, auto-creates the current Indian financial year (Apr–Mar).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAll() {
        try {
            Organization org = currentOrg();
            List<ReportingYear> years = reportingYearRepo.findByOrganizationId(org.getId());

            // Auto-seed the current financial year when the org has no periods yet
            if (years.isEmpty()) {
                years = List.of(seedCurrentFinancialYear(org));
            }

            List<Map<String, Object>> result = years.stream()
                    .sorted((a, b) -> b.getStartDate().compareTo(a.getStartDate()))
                    .map(this::toMap)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Reporting years fetched", result));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // ── POST /api/reporting-years ────────────────────────────────────────────
    /**
     * Create a new reporting year.
     * Body: { "yearLabel": "FY 2025-26", "startDate": "2025-04-01", "endDate":
     * "2026-03-31" }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'DATA_ENTRY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, String> body) {
        try {
            Organization org = currentOrg();
            String label = body.get("yearLabel");
            LocalDate start = LocalDate.parse(body.get("startDate"));
            LocalDate end = LocalDate.parse(body.get("endDate"));

            if (label == null || label.isBlank())
                throw new IllegalArgumentException("yearLabel is required");
            if (end.isBefore(start))
                throw new IllegalArgumentException("endDate must be after startDate");

            ReportingYear ry = reportingYearRepo.save(ReportingYear.builder()
                    .organization(org)
                    .yearLabel(label.trim())
                    .startDate(start)
                    .endDate(end)
                    .build());

            return ResponseEntity.ok(new ApiResponse<>(true, "Reporting year created", toMap(ry)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // ── private helpers ───────────────────────────────────────────────────────

    /** Seed the current Indian financial year (Apr 1 → Mar 31). */
    private ReportingYear seedCurrentFinancialYear(Organization org) {
        LocalDate today = LocalDate.now();
        int startYear = today.getMonthValue() >= 4 ? today.getYear() : today.getYear() - 1;
        int endYear = startYear + 1;
        String label = "FY " + startYear + "-" + String.valueOf(endYear).substring(2);

        return reportingYearRepo.save(ReportingYear.builder()
                .organization(org)
                .yearLabel(label)
                .startDate(LocalDate.of(startYear, 4, 1))
                .endDate(LocalDate.of(endYear, 3, 31))
                .build());
    }
}
