package com.carbon.accounting.infrastructure.persistence.repository;

import com.carbon.accounting.infrastructure.persistence.entity.FuelTypeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SpringDataFuelTypeRepository extends JpaRepository<FuelTypeEntity, UUID> {
}
