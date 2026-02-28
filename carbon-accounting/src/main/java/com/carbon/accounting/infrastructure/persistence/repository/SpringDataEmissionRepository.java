package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EmissionRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataEmissionRepository extends JpaRepository<EmissionRecordEntity, UUID> {
    List<EmissionRecordEntity> findByTenantIdAndPlantId(UUID tenantId, UUID plantId);
}
