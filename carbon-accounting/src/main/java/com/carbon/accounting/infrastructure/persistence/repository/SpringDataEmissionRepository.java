package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EmissionRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataEmissionRepository extends JpaRepository<EmissionRecordEntity, UUID> {
    List<EmissionRecordEntity> findByTenantIdAndPlantId(UUID tenantId, UUID plantId);

    List<EmissionRecordEntity> findByTenantIdAndPlantIdAndStatus(UUID tenantId, UUID plantId, String status);

    List<EmissionRecordEntity> findByTenantIdAndScopeOrderByRecordedAtDesc(UUID tenantId, String scope);

    List<EmissionRecordEntity> findByTenantIdAndScopeAndStatusOrderByRecordedAtDesc(UUID tenantId, String scope,
            String status);

    List<EmissionRecordEntity> findByTenantIdOrderByRecordedAtDesc(UUID tenantId);

    List<EmissionRecordEntity> findByTenantIdAndStatusOrderByRecordedAtDesc(UUID tenantId, String status);
}
