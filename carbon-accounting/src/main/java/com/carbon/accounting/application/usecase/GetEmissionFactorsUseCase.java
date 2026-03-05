package com.carbon.accounting.application.usecase;

import com.carbon.accounting.application.dto.EmissionFactorResponseDTO;
import com.carbon.accounting.core.repository.EmissionFactorRepository;
import com.carbacount.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GetEmissionFactorsUseCase {

    private final EmissionFactorRepository factorRepository;

    public List<EmissionFactorResponseDTO> execute(String scope) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        return factorRepository.findByLocationAndScope(
                principal.getIndustryTypeId(),
                scope,
                principal.getCountryId(),
                principal.getStateId()).stream()
                .map(entity -> EmissionFactorResponseDTO.builder()
                        .activityType(entity.getFuelTypeId() != null ? entity.getFuelTypeId().toString() : "Unknown")
                        .unit("TBD") // Will be updated to pull from fuel type
                        .factorValue(entity.getFactorValue())
                        .source(entity.getSource())
                        .year(entity.getYear())
                        .build())
                .collect(Collectors.toList());
    }
}
