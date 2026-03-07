package com.carbacount.auditor.dto;

import lombok.Data;

@Data
public class VerifyActionRequest {
    private String type;

    // Backward compatibility field
    private String action;

    // Preferred field for tagging workflow
    private String reviewStatus;

    private String reason; // Required if action = REJECTED
}
