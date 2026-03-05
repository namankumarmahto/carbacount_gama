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
 * Auditor verification endpoints.
 * Accessible by OWNER, ADMIN (with org-scoped token), and AUDITOR.
 */
@RestController
@RequestMapping("/api/auditor")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'AUDITOR')")
public class AuditorController {

    @Autowired
    private AuditorService auditorService;

    /**
     * Step 11: List all SUBMITTED records pending verification.
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<VerificationRecordDTO>>> getSubmittedRecords() {
        try {
            List<VerificationRecordDTO> records = auditorService.getSubmittedRecords();
            return ResponseEntity.ok(new ApiResponse<>(true, "Pending records fetched", records));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, "Failed to fetch records: " + e.getMessage(), null));
        }
    }

    /**
     * Step 11: VERIFY or REJECT a submission.
     * Body: { type: "SCOPE1"|"SCOPE2"|"SCOPE3"|"PRODUCTION", action:
     * "VERIFIED"|"REJECTED", reason?: string }
     */
    @PutMapping("/verify/{recordId}")
    public ResponseEntity<ApiResponse<String>> verifyRecord(
            @PathVariable UUID recordId,
            @Valid @RequestBody VerifyActionRequest request) {
        try {
            auditorService.verifyRecord(recordId, request);
            return ResponseEntity.ok(new ApiResponse<>(true,
                    "Record " + request.getAction() + " successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
