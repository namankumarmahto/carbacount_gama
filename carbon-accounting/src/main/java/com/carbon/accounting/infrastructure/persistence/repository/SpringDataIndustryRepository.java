package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringDataIndustryRepository extends JpaRepository<IndustryEntity, UUID> {
    java.util.List<IndustryEntity> findByTenantId(java.util.UUID tenantId);
}
