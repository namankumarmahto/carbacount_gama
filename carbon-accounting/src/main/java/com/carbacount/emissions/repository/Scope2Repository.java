package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.Scope2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface Scope2Repository extends JpaRepository<Scope2, UUID> {
    List<Scope2> findByFacilityIdAndReportingYearId(UUID facilityId, UUID reportingYearId);

    List<Scope2> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    List<Scope2> findByFacilityOrganizationId(UUID organizationId);
}
