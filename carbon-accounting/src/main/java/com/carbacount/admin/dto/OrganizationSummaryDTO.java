package com.carbacount.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrganizationSummaryDTO {
    private UUID id;
    private String name;
    private String industryType;
    private String country;
    private String state;
    private LocalDateTime createdAt;
    private String ownerEmail;
    private String ownerName;
    private UUID ownerId;
}
