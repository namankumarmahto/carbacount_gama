package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ScopeDashboardResponseDTO {
    private String scope;
    private Double totalEmission;
    private List<CategoryEmissionDTO> categoryBreakdown;
    private List<EmissionRecordDetailDTO> records;
}
