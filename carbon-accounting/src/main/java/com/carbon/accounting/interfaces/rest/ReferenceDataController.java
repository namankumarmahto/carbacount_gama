package com.carbon.accounting.interfaces.rest;

import com.carbacount.common.response.ApiResponse;
import com.carbon.accounting.infrastructure.persistence.entity.EmissionCategoryEntity;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryTypeEntity;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataEmissionCategoryRepository;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataIndustryTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final SpringDataIndustryTypeRepository industryTypeRepository;
    private final SpringDataEmissionCategoryRepository emissionCategoryRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataCountryRepository countryRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataStateRepository stateRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataActivityTemplateRepository activityTemplateRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataFuelTypeRepository fuelTypeRepository;

    @GetMapping("/industry-types")
    public ResponseEntity<ApiResponse<List<IndustryTypeEntity>>> getIndustryTypes() {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Industry types fetched successfully", industryTypeRepository.findAll()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<EmissionCategoryEntity>>> getCategories(
            @RequestParam("industryTypeId") UUID industryTypeId,
            @RequestParam("scope") String scope) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Categories fetched successfully",
                emissionCategoryRepository.findByIndustryTypeIdAndScope(industryTypeId, scope)));
    }

    @GetMapping("/countries")
    public ResponseEntity<ApiResponse<List<com.carbon.accounting.infrastructure.persistence.entity.CountryEntity>>> getCountries() {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Countries fetched successfully", countryRepository.findAll()));
    }

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<com.carbon.accounting.infrastructure.persistence.entity.StateEntity>>> getStates(
            @RequestParam("countryId") UUID countryId) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "States fetched successfully", stateRepository.findByCountryId(countryId)));
    }

    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<List<com.carbon.accounting.infrastructure.persistence.entity.ActivityTemplateEntity>>> getActivities(
            @RequestParam("industryTypeId") UUID industryTypeId,
            @RequestParam("categoryId") UUID categoryId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Activity templates fetched successfully",
                activityTemplateRepository.findByIndustryTypeIdAndCategoryId(industryTypeId, categoryId)));
    }

    @GetMapping("/fuels/{id}")
    public ResponseEntity<ApiResponse<com.carbon.accounting.infrastructure.persistence.entity.FuelTypeEntity>> getFuelType(
            @PathVariable("id") UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fuel type fetched successfully",
                fuelTypeRepository.findById(id).orElseThrow(() -> new RuntimeException("Fuel type not found"))));
    }
}
