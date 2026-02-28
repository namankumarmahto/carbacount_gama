package com.carbon.accounting.application.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardResponseDTO {
    private Double totalEmission;
    private Double scope1Total;
    private Double scope2Total;
    private Double scope3Total;
    private Double carbonIntensity;
    private List<MonthlyTrendDTO> monthlyTrends;
    private List<CategoryEmissionDTO> categoryBreakdown;
}
