package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EmissionCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataEmissionCategoryRepository extends JpaRepository<EmissionCategoryEntity, UUID> {
    List<EmissionCategoryEntity> findByIndustryTypeIdAndScope(UUID industryTypeId, String scope);
}
