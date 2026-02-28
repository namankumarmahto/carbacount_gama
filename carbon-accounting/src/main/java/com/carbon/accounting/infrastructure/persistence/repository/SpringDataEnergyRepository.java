package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.EnergyRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataEnergyRepository extends JpaRepository<EnergyRecordEntity, UUID> {
    List<EnergyRecordEntity> findByTenantIdAndPlantId(UUID tenantId, UUID plantId);
}
