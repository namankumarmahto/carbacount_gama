package com.carbacount.emissions.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataEntrySubmitRequest {
    private UUID facilityId;
    private UUID reportingYearId;
    private String scope; // SCOPE1 | SCOPE2 | SCOPE3 | PRODUCTION
    private List<FuelRowRequest> fuelRows; // For SCOPE1
    private List<ElectricityRowRequest> electricityRows; // For SCOPE2
    private List<Scope3RowRequest> scope3Rows; // For SCOPE3
    private ProductionDataRequest productionData; // For PRODUCTION
}
