package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.*;
import com.carbon.accounting.application.usecase.DraftEmissionUseCase;
import com.carbacount.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/emission/draft")
@RequiredArgsConstructor
public class EmissionDraftController {

    private final DraftEmissionUseCase draftUseCase;

    @PostMapping("/facility")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> createDraft(@RequestBody DraftFacilityDTO dto) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Draft created", draftUseCase.createDraft(dto)));
    }

    @PutMapping("/{id}/classification")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> updateClassification(
            @PathVariable UUID id,
            @RequestBody DraftClassificationDTO dto) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Classification updated", draftUseCase.updateClassification(id, dto)));
    }

    @PutMapping("/{id}/activity")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> updateActivity(
            @PathVariable UUID id,
            @RequestBody DraftActivityDTO dto) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Activity details updated", draftUseCase.updateActivity(id, dto)));
    }

    @PostMapping("/{id}/commit")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> commitDraft(@PathVariable UUID id) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Emission record committed to ledger", draftUseCase.commitDraft(id)));
    }
}
