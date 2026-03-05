package com.carbacount.emissions.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.emissions.dto.EmissionRecordResponse;
import com.carbacount.emissions.dto.VerifyRequest;
import com.carbacount.emissions.service.DataEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * VIEWER users see all PENDING records and can APPROVE or REJECT them.
 * Only APPROVED records appear on dashboards/reports.
 */
@RestController
@RequestMapping("/api/viewer")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'VIEWER')")
public class ViewerController {

    @Autowired
    private DataEntryService dataEntryService;

    /** Returns all records pending verification for the viewer's organization. */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getPendingRecords() {
        try {
            return ResponseEntity
                    .ok(new ApiResponse<>(true, "Pending records fetched", dataEntryService.getPendingRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Returns all records (pending + approved + rejected) for overview. */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getAllRecords() {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "All records fetched", dataEntryService.getAllRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Approve or reject a single emission record.
     * Body: { type: "FUEL|ELECTRICITY|SCOPE3", action: "APPROVE|REJECT", reason:
     * "..." }
     */
    @PutMapping("/verify/{recordId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'VIEWER')")
    public ResponseEntity<ApiResponse<String>> verifyRecord(
            @PathVariable UUID recordId,
            @RequestBody VerifyRequest req) {
        try {
            dataEntryService.verifyRecord(recordId, req.getType(), req.getAction(), req.getReason());
            String msg = "APPROVE".equalsIgnoreCase(req.getAction()) ? "Record approved" : "Record rejected";
            return ResponseEntity.ok(new ApiResponse<>(true, msg, msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
