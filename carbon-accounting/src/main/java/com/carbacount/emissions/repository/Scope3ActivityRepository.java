package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.Scope3Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
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

    List<Scope3Activity> findBySubmissionId(UUID submissionId);

    @Modifying
    void deleteBySubmissionId(UUID submissionId);

    @Query("SELECT COALESCE(SUM(s.calculatedEmission), 0) FROM Scope3Activity s WHERE s.facility.organization.id = :organizationId AND s.reportingYear.id = :reportingYearId AND s.status IN :statuses")
    BigDecimal sumCalculatedEmission(@Param("organizationId") UUID organizationId,
                                     @Param("reportingYearId") UUID reportingYearId,
                                     @Param("statuses") Collection<String> statuses);

    @Query("SELECT s.facility.id, s.facility.name, COALESCE(SUM(s.calculatedEmission), 0) FROM Scope3Activity s WHERE s.facility.organization.id = :organizationId AND s.reportingYear.id = :reportingYearId AND s.status IN :statuses GROUP BY s.facility.id, s.facility.name")
    List<Object[]> sumCalculatedEmissionByFacility(@Param("organizationId") UUID organizationId,
                                                   @Param("reportingYearId") UUID reportingYearId,
                                                   @Param("statuses") Collection<String> statuses);

    long countByFacilityOrganizationIdAndReportingYearId(UUID organizationId, UUID reportingYearId);

    long countByFacilityOrganizationIdAndReportingYearIdAndStatus(UUID organizationId, UUID reportingYearId, String status);

    long countByFacilityOrganizationIdAndReportingYearIdAndEmissionFactorIsNotNullAndCalculatedEmissionIsNotNull(UUID organizationId, UUID reportingYearId);
}
