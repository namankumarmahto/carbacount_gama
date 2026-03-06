package com.carbacount.auditor.dto;

import lombok.Data;

@Data
public class VerifyActionRequest {
    private String type;

    @jakarta.validation.constraints.NotBlank(message = "Action is required (VERIFIED or REJECTED)")
    private String action;

    private String reason; // Required if action = REJECTED
}
