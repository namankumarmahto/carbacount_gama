package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.Scope3Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface Scope3ActivityRepository extends JpaRepository<Scope3Activity, UUID> {
    List<Scope3Activity> findByFacilityIdAndReportingYearId(UUID facilityId, UUID reportingYearId);

    List<Scope3Activity> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    List<Scope3Activity> findByFacilityOrganizationId(UUID organizationId);

    // DATA_ENTRY: filter by assigned facility IDs only
    List<Scope3Activity> findByFacilityIdIn(List<UUID> facilityIds);

    List<Scope3Activity> findByFacilityIdInAndStatus(List<UUID> facilityIds, String status);
}
