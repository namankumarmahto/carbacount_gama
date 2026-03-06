package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.owner.dto.OwnerDashboardResponse;
import com.carbacount.owner.service.OwnerDashboardService;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    @GetMapping("/owner")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> getOwnerDashboard(
            @RequestParam(name = "reportingYearId", required = false) UUID reportingYearId) {
        try {
            OwnerDashboardResponse response = ownerDashboardService.getOwnerDashboard(reportingYearId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Owner dashboard fetched successfully", response));
        } catch (Exception e) {
            log.error("Failed to fetch owner dashboard", e);
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
