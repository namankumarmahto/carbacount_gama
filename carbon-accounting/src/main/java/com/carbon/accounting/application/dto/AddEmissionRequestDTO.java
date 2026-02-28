package com.carbon.accounting.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.PastOrPresent;
import java.time.Instant;
import java.util.UUID;

@Data
public class AddEmissionRequestDTO {
    @NotNull(message = "Plant ID is required")
    private UUID plantId;

    private String scope;
    private UUID categoryId;
    private String customCategoryName;

    @NotNull(message = "Total emission is required")
    @PositiveOrZero(message = "Total emission must be positive or zero")
    private Double totalEmission;

    @NotNull(message = "Recorded at timestamp is required")
    private Instant recordedAt;
}
