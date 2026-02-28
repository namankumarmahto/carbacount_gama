package com.carbon.accounting.interfaces.scheduler;

import com.carbon.accounting.core.domain.service.AggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DailyAggregationScheduler {

    private final AggregationService aggregationService;

    // Runs every night at 1 AM
    @Scheduled(cron = "0 0 1 * * ?")
    public void runDailyAggregation() {
        // Future: Fetch all plant IDs and call aggregationService.aggregateDaily
        System.out.println("Running daily aggregation...");
        // aggregationService.aggregateDaily(...)
    }
}
