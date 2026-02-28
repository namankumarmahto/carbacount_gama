package com.carbon.accounting.core.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AggregationService {

    // private final EmissionRepository emissionRepository;

    public void aggregateDaily(UUID plantId, LocalDate date) {
        // Future: Filter by date and sum emissions...
    }

    public void aggregateMonthly(UUID plantId, YearMonth month) {
        // Logic to consolidate daily summaries into monthly...
    }
}
