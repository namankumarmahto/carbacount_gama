package com.carbon.accounting.infrastructure.messaging;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.application.usecase.AddEmissionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RealTimeEmissionIngestionService {

    private final AddEmissionUseCase addEmissionUseCase;

    public void ingest(AddEmissionRequestDTO dto) {
        // In a real scenario, this might involve more pre-processing or async buffering
        // For now, we reuse the clean AddEmissionUseCase
        addEmissionUseCase.execute(dto);
    }
}
