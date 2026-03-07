package com.carbacount.emissions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionFactorOptionsResponse {
    private String scope;
    private String industry;
    private List<String> activityTypes;
    private List<String> sources;
    private List<OptionRow> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OptionRow {
        private String activityType;
        private String source;
        private String unit;
        private BigDecimal factorValue;
        private String factorUnit;
        private Integer year;
    }
}
