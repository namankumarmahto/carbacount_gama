package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EmissionRecordDetailDTO {
    private UUID id;
    private String category;
    private String activityType;
    private Double activityQuantity;
    private String activityUnit;
    private Double value;
    private Instant recordedAt;
}
