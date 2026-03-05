package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.infrastructure.messaging.RealTimeEmissionIngestionService;
import com.carbon.accounting.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/realtime/emission")
@RequiredArgsConstructor
public class RealtimeEmissionController {

    private final RealTimeEmissionIngestionService ingestionService;

    @PostMapping
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
    public ResponseEntity<ApiResponse<String>> ingestEmission(@Valid @RequestBody AddEmissionRequestDTO request) {
        ingestionService.ingest(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Real-time data ingested successfully", null));
    }
}
