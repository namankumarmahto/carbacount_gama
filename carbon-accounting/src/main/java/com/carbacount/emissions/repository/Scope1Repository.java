package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.Scope1;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface Scope1Repository extends JpaRepository<Scope1, UUID> {
    List<Scope1> findByFacilityIdAndReportingYearId(UUID facilityId, UUID reportingYearId);

    List<Scope1> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    List<Scope1> findByFacilityOrganizationId(UUID organizationId);
}
