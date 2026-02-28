package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EmissionResponseDTO {
    private UUID emissionId;
    private Double totalEmission;
    private Instant recordedAt;
    private UUID plantId;
    private UUID tenantId;
}
