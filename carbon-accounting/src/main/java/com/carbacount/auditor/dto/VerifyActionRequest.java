package com.carbacount.auditor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyActionRequest {
    @NotBlank(message = "Record type is required (SCOPE1, SCOPE2, SCOPE3, PRODUCTION)")
    private String type;

    @NotBlank(message = "Action is required (VERIFIED or REJECTED)")
    private String action;

    private String reason; // Required if action = REJECTED
}
