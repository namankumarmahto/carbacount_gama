package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.usecase.BulkIngestionUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
@RequiredArgsConstructor
public class BulkIngestionController {

    private final BulkIngestionUseCase bulkIngestionUseCase;

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkUpload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            List<String> results = bulkIngestionUseCase.execute(file);

            long successCount = results.stream().filter(r -> r.contains("Success")).count();
            long errorCount = results.size() - successCount;

            return ResponseEntity.ok(Map.of(
                    "summary",
                    String.format("Processed %d rows: %d Success, %d Errors", results.size(), successCount, errorCount),
                    "details", results,
                    "status", errorCount == 0 ? "COMPLETED" : "PARTIAL_SUCCESS"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
