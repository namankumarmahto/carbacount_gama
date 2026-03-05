package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.application.dto.PlantResponseDTO;
import com.carbon.accounting.common.response.ApiResponse;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataPlantRepository;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/plants")
@RequiredArgsConstructor
public class PlantController {

        private final SpringDataPlantRepository plantRepository;

        @GetMapping
        @PreAuthorize("hasRole('INDUSTRY') or hasRole('OWNER')")
        public ResponseEntity<ApiResponse<List<PlantResponseDTO>>> getPlants() {
                UserPrincipal userPrincipal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                                .getPrincipal();

                List<PlantEntity> plants = plantRepository.findByTenantIdAndIndustryId(
                                userPrincipal.getTenantId(),
                                userPrincipal.getIndustryId());

                List<PlantResponseDTO> response = plants.stream()
                                .map(p -> new PlantResponseDTO(p.getId(), p.getName(), p.getLocation()))
                                .collect(Collectors.toList());

                return ResponseEntity.ok(new ApiResponse<>(true, "Plants fetched successfully", response));
        }
}
