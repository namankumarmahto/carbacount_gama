package com.carbacount.owner.service;

import com.carbacount.emissions.entity.EmissionFactor;
import com.carbacount.emissions.repository.EmissionFactorRepository;
import com.carbacount.owner.dto.EmissionFactorRequest;
import com.carbacount.owner.dto.EmissionFactorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OwnerEmissionFactorService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Transactional(readOnly = true)
    public List<EmissionFactorResponse> getFactors(String scopeType) {
        List<EmissionFactor> factors = (scopeType == null || scopeType.isBlank())
                ? emissionFactorRepository.findAllByOrderByFactorYearDescCreatedAtDesc()
                : emissionFactorRepository.findByScopeTypeOrderByFactorYearDescCreatedAtDesc(scopeType.trim().toUpperCase());
        return factors.stream().map(this::toResponse).toList();
    }

    @Transactional
    public EmissionFactorResponse createFactor(EmissionFactorRequest request) {
        validateRequest(request);

        if (emissionFactorRepository.existsDuplicate(
                request.getScopeType(), request.getSourceName(), request.getUnit(), request.getYear())) {
            throw new IllegalArgumentException("Duplicate emission factor exists for same scope, source, unit and year");
        }

        EmissionFactor factor = new EmissionFactor();
        applyRequest(factor, request);
        return toResponse(emissionFactorRepository.save(factor));
    }

    @Transactional
    public EmissionFactorResponse updateFactor(UUID id, EmissionFactorRequest request) {
        validateRequest(request);

        if (emissionFactorRepository.existsDuplicateExcludingId(
                id, request.getScopeType(), request.getSourceName(), request.getUnit(), request.getYear())) {
            throw new IllegalArgumentException("Duplicate emission factor exists for same scope, source, unit and year");
        }

        EmissionFactor factor = emissionFactorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emission factor not found"));
        applyRequest(factor, request);
        return toResponse(emissionFactorRepository.save(factor));
    }

    @Transactional
    public void deleteFactor(UUID id) {
        EmissionFactor factor = emissionFactorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emission factor not found"));
        emissionFactorRepository.delete(factor);
    }

    private void validateRequest(EmissionFactorRequest request) {
        if (request.getScopeType() == null || request.getScopeType().isBlank()) {
            throw new IllegalArgumentException("Scope type is required");
        }
        if (request.getSourceName() == null || request.getSourceName().isBlank()) {
            throw new IllegalArgumentException("Source name is required");
        }
        if (request.getUnit() == null || request.getUnit().isBlank()) {
            throw new IllegalArgumentException("Unit is required");
        }
        if (request.getFactorValue() == null || request.getFactorValue().doubleValue() <= 0) {
            throw new IllegalArgumentException("Emission factor value must be positive");
        }
        if (request.getYear() == null || request.getYear() < 1900 || request.getYear() > 2200) {
            throw new IllegalArgumentException("Year is invalid");
        }
        if (request.getCountry() == null || request.getCountry().isBlank()) {
            throw new IllegalArgumentException("Country is required");
        }
    }

    private void applyRequest(EmissionFactor factor, EmissionFactorRequest request) {
        String scope = request.getScopeType().trim().toUpperCase();
        factor.setScopeType(scope);
        factor.setActivityType(request.getActivityType() == null || request.getActivityType().isBlank() ? "General" : request.getActivityType().trim());
        factor.setSourceName(request.getSourceName().trim());
        factor.setUnit(request.getUnit().trim());
        factor.setFactorValue(request.getFactorValue());
        factor.setUnitOfFactor(request.getUnitOfFactor() == null || request.getUnitOfFactor().isBlank()
                ? "kg CO2e per unit"
                : request.getUnitOfFactor().trim());
        factor.setCountry(request.getCountry().trim());
        factor.setFactorYear(request.getYear());

        // Keep backward compatibility for existing lookup fields.
        factor.setFuelType(null);
        factor.setElectricitySource(null);
        if ("SCOPE1".equals(scope) || "SCOPE3".equals(scope)) {
            factor.setFuelType(request.getSourceName().trim());
        } else if ("SCOPE2".equals(scope)) {
            factor.setElectricitySource(request.getSourceName().trim());
        }
    }

    private EmissionFactorResponse toResponse(EmissionFactor factor) {
        return EmissionFactorResponse.builder()
                .id(factor.getId())
                .scopeType(factor.getScopeType())
                .activityType(factor.getActivityType())
                .sourceName(factor.getSourceName())
                .unit(factor.getUnit())
                .factorValue(factor.getFactorValue())
                .unitOfFactor(factor.getUnitOfFactor())
                .country(factor.getCountry())
                .year(factor.getFactorYear())
                .createdAt(factor.getCreatedAt())
                .build();
    }
}
