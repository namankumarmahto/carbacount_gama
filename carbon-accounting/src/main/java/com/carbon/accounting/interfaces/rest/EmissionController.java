package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.AddEmissionRequestDTO;
import com.carbon.accounting.application.dto.EmissionResponseDTO;
import com.carbon.accounting.application.usecase.AddEmissionUseCase;
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
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionController {

    private final AddEmissionUseCase addEmissionUseCase;

    @PostMapping
    @PreAuthorize("hasRole('INDUSTRY')")
    public ResponseEntity<ApiResponse<EmissionResponseDTO>> addEmission(
            @Valid @RequestBody AddEmissionRequestDTO request) {
        EmissionResponseDTO response = addEmissionUseCase.execute(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Emission added successfully", response));
    }
}
