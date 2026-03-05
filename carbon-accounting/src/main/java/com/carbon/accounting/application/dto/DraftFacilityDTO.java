package com.carbon.accounting.application.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class DraftFacilityDTO {
    private UUID plantId;
    private String department;
    private String responsiblePerson;
    private Instant reportingPeriodStart;
    private Instant reportingPeriodEnd;
    private String reportingFrequency;
    private String dataSource;
}
