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

    @GetMapping
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardResponseDTO>> getDashboard() {
        DashboardResponseDTO response = getDashboardUseCase.execute();
        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard data fetched successfully", response));
    }
}
