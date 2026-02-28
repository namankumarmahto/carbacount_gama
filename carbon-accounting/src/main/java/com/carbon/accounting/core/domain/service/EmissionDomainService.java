package com.carbon.accounting.core.domain.service;

import com.carbon.accounting.application.exception.InvalidEmissionDataException;
import com.carbon.accounting.core.domain.model.EmissionRecord;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Service
public class EmissionDomainService {

    public void validateEmissionRecord(EmissionRecord record) {
        if (record.getScope() == null || record.getScope().isEmpty()) {
            throw new InvalidEmissionDataException("Scope must not be empty");
        }
        if (record.getCategoryId() == null
                && (record.getCustomCategoryName() == null || record.getCustomCategoryName().isEmpty())) {
            throw new InvalidEmissionDataException("Either Category ID or Custom Category Name must be provided");
        }
        if (record.getRecordedAt().isAfter(Instant.now())) {
            throw new IllegalArgumentException("Recorded at timestamp cannot be in the future");
        }
    }

    public Double calculateTotalEmission(Double scope1, Double scope2, Double scope3) {
        return (scope1 != null ? scope1 : 0.0) +
                (scope2 != null ? scope2 : 0.0) +
                (scope3 != null ? scope3 : 0.0);
    }

    // Immutable logic: No update method. Logic is in the model and repository
    // adapter.
}
