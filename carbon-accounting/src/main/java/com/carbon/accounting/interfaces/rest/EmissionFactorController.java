package com.carbon.accounting.interfaces.rest;

import com.carbacount.common.response.ApiResponse;
import com.carbacount.emissions.dto.EmissionFactorOptionsResponse;
import com.carbacount.emissions.dto.EmissionFactorValueResponse;
import com.carbacount.emissions.service.EmissionFactorLookupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emission-factors")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY', 'VIEWER')")
public class EmissionFactorController {

    private final EmissionFactorLookupService emissionFactorLookupService;

    @GetMapping
    public ResponseEntity<ApiResponse<EmissionFactorOptionsResponse>> getFactors(@RequestParam String scope,
                                                                                  @RequestParam(required = false) String industry) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Factors retrieved successfully",
                    emissionFactorLookupService.getOptions(scope, industry)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/units")
    public ResponseEntity<ApiResponse<List<String>>> getUnits(@RequestParam(required = false) String scope,
                                                              @RequestParam String source,
                                                              @RequestParam(required = false) String industry) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Units retrieved successfully",
                    emissionFactorLookupService.getUnits(scope, source, industry)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/factor")
    public ResponseEntity<ApiResponse<EmissionFactorValueResponse>> getFactor(@RequestParam(required = false) String scope,
                                                                              @RequestParam String source,
                                                                              @RequestParam String unit,
                                                                              @RequestParam(required = false) String activityType,
                                                                              @RequestParam(required = false) String country,
                                                                              @RequestParam(required = false) String industry) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(true, "Emission factor retrieved successfully",
                    emissionFactorLookupService.getFactor(scope, source, unit, activityType, country, industry)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
