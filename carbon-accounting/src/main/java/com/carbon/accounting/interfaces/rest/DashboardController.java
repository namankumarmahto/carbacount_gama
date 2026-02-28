package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.DashboardResponseDTO;
import com.carbon.accounting.application.usecase.GetDashboardUseCase;
import com.carbon.accounting.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final GetDashboardUseCase getDashboardUseCase;
    private final com.carbon.accounting.application.usecase.GetScopeDashboardUseCase getScopeDashboardUseCase;

    @GetMapping
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponseDTO>> getDashboard() {
        DashboardResponseDTO response = getDashboardUseCase.execute();
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard data fetched successfully", response));
    }

    @GetMapping("/scope/{scope}")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.carbon.accounting.application.dto.ScopeDashboardResponseDTO>> getScopeDashboard(
            @org.springframework.web.bind.annotation.PathVariable String scope,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.Instant startDate,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.Instant endDate) {

        com.carbon.accounting.application.dto.ScopeDashboardResponseDTO response = getScopeDashboardUseCase
                .execute(scope, startDate, endDate);
        return ResponseEntity.ok(new ApiResponse<>(true, "Scope Dashboard data fetched successfully", response));
    }
}
