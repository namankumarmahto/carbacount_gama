package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.EmissionFactorResponseDTO;
import com.carbon.accounting.application.usecase.GetEmissionFactorsUseCase;
import com.carbon.accounting.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/emission-factors")
@RequiredArgsConstructor
public class EmissionFactorController {

    private final GetEmissionFactorsUseCase getEmissionFactorsUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmissionFactorResponseDTO>>> getFactors(@RequestParam String scope) {
        List<EmissionFactorResponseDTO> factors = getEmissionFactorsUseCase.execute(scope);
        return ResponseEntity.ok(new ApiResponse<>(true, "Factors retrieved successfully", factors));
    }
}
