package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.infrastructure.service.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/ingestion")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadEvidence(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        try {
            String filename = evidenceService.store(file);
            // Return a reference that the frontend can use to link with the emission record
            return ResponseEntity.ok(Map.of(
                    "url", "/api/ingestion/files/" + filename,
                    "filename", filename,
                    "status", "UPLOADED"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/files/{filename:.+}")
    @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path file = evidenceService.load(filename);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
