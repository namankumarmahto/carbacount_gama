package com.carbacount.facility.dto;

import com.carbacount.common.enums.FacilityStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class FacilityDTO {
    private UUID id;

    @NotBlank(message = "Facility name is required")
    private String name;

    private String country;
    private String state;
    private String city;
    private BigDecimal productionCapacity;
    private String productType;
    private FacilityStatus status;
}
