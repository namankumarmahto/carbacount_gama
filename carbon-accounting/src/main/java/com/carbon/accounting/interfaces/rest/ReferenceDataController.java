package com.carbon.accounting.interfaces.rest;

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

    @GetMapping("/industry-types")
    public ResponseEntity<List<IndustryTypeEntity>> getIndustryTypes() {
        return ResponseEntity.ok(industryTypeRepository.findAll());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<EmissionCategoryEntity>> getCategories(
            @RequestParam UUID industryTypeId,
            @RequestParam String scope) {
        return ResponseEntity.ok(emissionCategoryRepository.findByIndustryTypeIdAndScope(industryTypeId, scope));
    }
}
