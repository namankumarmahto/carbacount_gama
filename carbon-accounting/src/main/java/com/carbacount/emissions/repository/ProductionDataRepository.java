package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.ProductionData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductionDataRepository extends JpaRepository<ProductionData, UUID> {

    List<ProductionData> findByFacilityOrganizationId(UUID organizationId);

    List<ProductionData> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    // DATA_ENTRY: filter by assigned facility IDs only
    List<ProductionData> findByFacilityIdIn(List<UUID> facilityIds);

    List<ProductionData> findByFacilityIdInAndStatus(List<UUID> facilityIds, String status);
}
