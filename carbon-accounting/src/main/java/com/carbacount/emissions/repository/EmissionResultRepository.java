package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.EmissionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmissionResultRepository extends JpaRepository<EmissionResult, UUID> {
    List<EmissionResult> findByFacilityIdAndReportingYearId(UUID facilityId, UUID reportingYearId);

    List<EmissionResult> findByReportingYearId(UUID reportingYearId);
}
