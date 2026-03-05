package com.carbacount.emissions.controller;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.emissions.dto.DataEntrySubmitRequest;
import com.carbacount.emissions.dto.EmissionRecordResponse;
import com.carbacount.emissions.service.DataEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * DATA_ENTRY users submit emission records here.
 * Submitted records start with status=PENDING until verified by a VIEWER.
 */
@RestController
@RequestMapping("/api/data-entry/emission")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY')")
public class DataEntryEmissionController {

    @Autowired
    private DataEntryService dataEntryService;

    /** Submit scope 1/2/3 emission rows. Returns count of saved records. */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Integer>> submit(@RequestBody DataEntrySubmitRequest req) {
        try {
            int count = dataEntryService.submitData(req);
            return ResponseEntity
                    .ok(new ApiResponse<>(true, count + " records submitted and awaiting verification", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * DATA_ENTRY user sees their own submitted records and their verification
     * status.
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getMySubmissions() {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Fetched", dataEntryService.getMySubmissions()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * All (approved + pending) for owners/admins viewing the data entry dashboard.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getAllRecords() {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Fetched", dataEntryService.getAllRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /** Approved records only — used by emissions analytics page. */
    @GetMapping("/approved")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getApprovedRecords() {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Fetched", dataEntryService.getApprovedRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
