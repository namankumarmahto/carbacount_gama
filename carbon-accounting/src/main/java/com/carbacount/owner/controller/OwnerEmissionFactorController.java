package com.carbacount.owner.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.owner.dto.EmissionFactorRequest;
import com.carbacount.owner.dto.EmissionFactorResponse;
import com.carbacount.owner.service.OwnerEmissionFactorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/owner/emission-factors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public class OwnerEmissionFactorController {

    private final OwnerEmissionFactorService ownerEmissionFactorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmissionFactorResponse>>> getFactors(
            @RequestParam(required = false) String scopeType) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched", ownerEmissionFactorService.getFactors(scopeType)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmissionFactorResponse>> createFactor(
            @RequestBody EmissionFactorRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", ownerEmissionFactorService.createFactor(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmissionFactorResponse>> updateFactor(
            @PathVariable UUID id,
            @RequestBody EmissionFactorRequest request) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Updated", ownerEmissionFactorService.updateFactor(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteFactor(@PathVariable UUID id) {
        ownerEmissionFactorService.deleteFactor(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", "Deleted"));
    }
}
