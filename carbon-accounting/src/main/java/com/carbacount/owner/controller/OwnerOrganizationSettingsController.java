package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.owner.dto.OwnerOrganizationSettingsRequest;
import com.carbacount.owner.dto.OwnerOrganizationSettingsResponse;
import com.carbacount.owner.service.OwnerOrganizationSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner/org-settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerOrganizationSettingsController {

    private final OwnerOrganizationSettingsService ownerOrganizationSettingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<OwnerOrganizationSettingsResponse>> getSettings() {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Fetched", ownerOrganizationSettingsService.getSettings()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping
    public ResponseEntity<ApiResponse<OwnerOrganizationSettingsResponse>> updateSettings(
            @RequestBody OwnerOrganizationSettingsRequest request) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Updated", ownerOrganizationSettingsService.updateSettings(request)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
