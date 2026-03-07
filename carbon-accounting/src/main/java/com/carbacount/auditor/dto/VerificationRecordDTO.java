package com.carbacount.auditor.dto;

import java.util.List;
import com.carbacount.emissions.dto.SubmissionDocumentResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRecordDTO {
    private UUID id;
    private UUID submissionId;
    private String type; // "SCOPE1", "SCOPE2", "SCOPE3", "PRODUCTION"
    private String facilityName;
    private UUID facilityId;
    private String reportingYear;
    private String status;
    private String reviewStatus;
    private String submittedByEmail;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;

    // Scope-specific fields
    private String fuelType; // Scope 1
    private String electricitySource; // Scope 2
    private String category; // Scope 3
    private Double totalProduction; // Production

    private Double quantity;
    private String unit;
    private Double emissionFactor;
    private Double calculatedEmission;
    private String rejectionReason;
    private List<SubmissionDocumentResponse> documents;
}
