package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataPlantRepository extends JpaRepository<PlantEntity, UUID> {
    List<PlantEntity> findByTenantIdAndIndustryId(UUID tenantId, UUID industryId);
}
