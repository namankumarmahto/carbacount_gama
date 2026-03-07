package com.carbacount.emissions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EditableSubmissionResponse {
    private UUID submissionId;
    private UUID facilityId;
    private UUID reportingYearId;
    private String scope;
    private String status;
    private List<FuelRowRequest> fuelRows;
    private List<ElectricityRowRequest> electricityRows;
    private List<Scope3RowRequest> scope3Rows;
    private ProductionDataRequest productionData;
}
