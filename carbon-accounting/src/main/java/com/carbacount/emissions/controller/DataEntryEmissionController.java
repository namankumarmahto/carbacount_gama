package com.carbacount.emissions.controller;

import com.carbacount.common.exception.FacilityAccessDeniedException;
import com.carbacount.common.response.ApiResponse;
import com.carbacount.common.service.FileStorageService;
import com.carbacount.emissions.dto.*;
import com.carbacount.emissions.dto.EditableSubmissionResponse;
import com.carbacount.emissions.repository.SubmissionDocumentRepository;
import com.carbacount.emissions.service.DataEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * DATA_ENTRY users submit emission records here.
 * Submitted records start with status=SUBMITTED until verified by a
 * VIEWER/AUDITOR.
 *
 * Access control summary:
 * - /submit → DATA_ENTRY, OWNER, ADMIN (backend enforces facility assignment
 * for DATA_ENTRY)
 * - /my-submissions → DATA_ENTRY, OWNER, ADMIN (DATA_ENTRY sees only
 * assigned-facility records)
 * - /all → OWNER, ADMIN only
 * - /approved → all org roles
 */
@RestController
@RequestMapping("/api/data-entry/emission")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY')")
public class DataEntryEmissionController {

    @Autowired
    private DataEntryService dataEntryService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private SubmissionDocumentRepository documentRepo;

    /**
     * Submit scope 1 / 2 / 3 / production rows with optional documents.
     */
    @PostMapping(value = "/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Integer>> submit(
            @RequestPart("data") DataEntrySubmitRequest req,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            int count = dataEntryService.submitData(req, files);
            return ResponseEntity.ok(
                    new ApiResponse<>(true, count + " records submitted and awaiting verification", count));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<RealtimeEmissionResponse>> calculate(@RequestBody RealtimeEmissionRequest req) {
        try {
            RealtimeEmissionResponse response = dataEntryService.calculateEmission(req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Calculated", response));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * DATA_ENTRY users see their own submissions for their assigned facilities.
     * OWNER / ADMIN see their own submissions across the whole organization.
     */
    @GetMapping("/my-submissions")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getMySubmissions() {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Fetched", dataEntryService.getMySubmissions()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Fetch all activity rows for one submission.
     */
    @GetMapping("/submission/{submissionId}/details")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getSubmissionDetails(
            @PathVariable UUID submissionId) {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Fetched", dataEntryService.getSubmissionDetails(submissionId)));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/submission/{submissionId}/edit-data")
    public ResponseEntity<ApiResponse<EditableSubmissionResponse>> getEditableSubmission(
            @PathVariable UUID submissionId) {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Fetched", dataEntryService.getEditableSubmission(submissionId)));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/submission/{submissionId}")
    public ResponseEntity<ApiResponse<Integer>> updateSubmission(@PathVariable UUID submissionId,
            @RequestBody DataEntrySubmitRequest req) {
        try {
            int count = dataEntryService.updateSubmission(submissionId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Updated and resubmitted", count));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/submission/{submissionId}")
    public ResponseEntity<ApiResponse<String>> deleteSubmission(@PathVariable UUID submissionId) {
        try {
            dataEntryService.deleteSubmission(submissionId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Deleted", "Deleted"));
        } catch (FacilityAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * All records for the organization — OWNER / ADMIN only.
     */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getAllRecords() {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Fetched", dataEntryService.getAllRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    /**
     * Approved (VERIFIED) records — used by emissions analytics pages.
     */
    @GetMapping("/approved")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY', 'VIEWER')")
    public ResponseEntity<ApiResponse<List<EmissionRecordResponse>>> getApprovedRecords() {
        try {
            return ResponseEntity.ok(
                    new ApiResponse<>(true, "Fetched", dataEntryService.getApprovedRecords()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/documents/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID documentId) {
        try {
            var doc = documentRepo.findById(documentId)
                    .orElseThrow(() -> new RuntimeException("Document not found"));

            byte[] fileData = fileStorageService.downloadFile(doc.getFileUrl());

            String contentType = doc.getFileType();
            if (contentType == null || contentType.isBlank()) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getFileName() + "\"")
                    .body(fileData);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
