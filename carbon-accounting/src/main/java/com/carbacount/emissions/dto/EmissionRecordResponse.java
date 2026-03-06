package com.carbacount.emissions.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionRecordResponse {
    private UUID id;
    private UUID submissionId;
    private String type; // FUEL | ELECTRICITY | SCOPE3 | PRODUCTION
    private String scope; // SCOPE1 | SCOPE2 | SCOPE3 | PRODUCTION
    private UUID facilityId;
    private String facilityName;
    private String reportingYear;
    private String fuelType; // for SCOPE1
    private String electricitySource; // for SCOPE2
    private String category; // for SCOPE3
    private String subCategory; // for SCOPE3
    private BigDecimal totalProduction; // for PRODUCTION
    private String unit;
    private BigDecimal quantity;
    private BigDecimal emissionFactor;
    private BigDecimal calculatedEmission;
    private BigDecimal totalEmission;
    private String status; // PENDING | APPROVED | REJECTED
    private String rejectionReason;
    private String submittedBy;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
}
