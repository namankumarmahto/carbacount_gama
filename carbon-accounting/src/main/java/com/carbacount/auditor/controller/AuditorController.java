package com.carbacount.auditor.controller;

import com.carbacount.auditor.dto.VerificationRecordDTO;
import com.carbacount.auditor.dto.VerifyActionRequest;
import com.carbacount.auditor.service.AuditorService;
import com.carbacount.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Auditor verification endpoints for scope-wise data entry reviews.
 * Accessible only by roles with AUDITOR privileges.
 */
@RestController
@RequestMapping("/api/auditor")
@PreAuthorize("hasRole('AUDITOR')")
public class AuditorController {

    @Autowired
    private AuditorService auditorService;

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse<List<VerificationRecordDTO>>> getRecordsByReviewStatus(
            @RequestParam(defaultValue = "PENDING_REVIEW") String reviewStatus) {
        try {
            List<VerificationRecordDTO> records = auditorService.getRecordsByReviewStatus(reviewStatus);
            return ResponseEntity.ok(new ApiResponse<>(true, "Records fetched", records));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to fetch records: " + e.getMessage(), null));
        }
    }

    // Backward compatibility
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<VerificationRecordDTO>>> getPendingRecordsCompat() {
        return getRecordsByReviewStatus("PENDING_REVIEW");
    }

    @PutMapping("/verify/{submissionId}")
    public ResponseEntity<ApiResponse<String>> verifyRecord(
            @PathVariable UUID submissionId,
            @Valid @RequestBody VerifyActionRequest request) {
        try {
            auditorService.verifySubmission(submissionId, request);
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Submission review status updated successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
