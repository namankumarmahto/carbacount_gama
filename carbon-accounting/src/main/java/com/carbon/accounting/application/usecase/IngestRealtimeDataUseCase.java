package com.carbon.accounting.application.usecase;

import com.carbon.accounting.core.domain.model.EmissionRecord;
import com.carbon.accounting.core.repository.EmissionRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class IngestRealtimeDataUseCase {

    private final EmissionRepository emissionRepository;

    public void execute(IngestRealtimeDataRequest request) {
        // High-frequency ingestion: simple store for now
        EmissionRecord record = EmissionRecord.builder()
                .id(UUID.randomUUID())
                .plantId(request.getPlantId())
                .scope(request.getScope())
                .categoryId(request.getCategoryId())
                .customCategoryName(request.getCustomCategoryName())
                .totalEmission(request.getEmissionValue())
                .recordedAt(Instant.now())
                .createdAt(Instant.now())
                .build();

        emissionRepository.save(record);

        // Future: Trigger async processing or websocket update
    }

    // Assuming this DTO is defined elsewhere or needs to be added.
    // For this exercise, we'll include a basic definition here
    // to make the code syntactically correct.
    @Data
    @Builder
    public static class IngestRealtimeDataRequest {
        private UUID plantId;
        private String scope;
        private UUID categoryId;
        private String customCategoryName;
        private Double emissionValue;
    }
}
