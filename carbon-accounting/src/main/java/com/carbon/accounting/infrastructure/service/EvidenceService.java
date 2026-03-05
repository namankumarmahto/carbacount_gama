package com.carbon.accounting.infrastructure.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class EvidenceService {

    private final Path rootLocation = Paths.get("uploads/evidence");

    public EvidenceService() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    public String store(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                originalFilename = "unknown";
            }

            String filename = UUID.randomUUID().toString() + "_" + originalFilename.replaceAll("\\s+", "_");
            Path destinationFile = this.rootLocation.resolve(Paths.get(filename)).normalize().toAbsolutePath();

            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Cannot store file outside designated directory.");
            }

            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            // Return the relative path or unique filename for database storage
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }
}
