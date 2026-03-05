package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkIngestionUseCase {

    private final AddEmissionUseCase addEmissionUseCase;

    @Transactional
    public List<String> execute(MultipartFile file) {
        List<String> results = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int rowNumber = 0;

            // Expected format:
            // PlantId,RecordedAt,Scope,ActivityType,Quantity,Department,ResponsiblePerson
            while ((line = reader.readLine()) != null) {
                rowNumber++;

                // Skip header or empty lines
                if (rowNumber == 1 || line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",");
                if (data.length < 5) {
                    results.add(String.format(
                            "Row %d: Error - Minimum 5 columns required (PlantId,RecordedAt,Scope,ActivityType,Quantity)",
                            rowNumber));
                    continue;
                }

                try {
                    AddEmissionRequestDTO dto = new AddEmissionRequestDTO();
                    dto.setPlantId(UUID.fromString(data[0].trim()));
                    dto.setRecordedAt(Instant.parse(data[1].trim()));
                    dto.setScope(data[2].trim());
                    dto.setActivityType(data[3].trim());
                    dto.setQuantity(Double.parseDouble(data[4].trim()));

                    if (data.length > 5 && !data[5].trim().isEmpty()) {
                        dto.setDepartment(data[5].trim());
                    }

                    if (data.length > 6 && !data[6].trim().isEmpty()) {
                        dto.setResponsiblePerson(data[6].trim());
                    }

                    dto.setStatus("COMMITTED");
                    dto.setReportingFrequency("Monthly");
                    dto.setDataSource("Bulk CSV");

                    addEmissionUseCase.execute(dto);
                    results.add(String.format("Row %d: Success (%s)", rowNumber, data[3].trim()));

                } catch (Exception e) {
                    log.error("Error processing row {}: {}", rowNumber, e.getMessage());
                    results.add(String.format("Row %d: Error - %s", rowNumber, e.getMessage()));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("CRITICAL: Failed to parse CSV file. " + e.getMessage(), e);
        }

        return results;
    }
}
