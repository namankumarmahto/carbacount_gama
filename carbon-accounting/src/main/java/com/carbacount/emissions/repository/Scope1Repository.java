package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.Scope1;
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
public interface Scope1Repository extends JpaRepository<Scope1, UUID> {
    List<Scope1> findByFacilityIdAndReportingYearId(UUID facilityId, UUID reportingYearId);

    List<Scope1> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    List<Scope1> findByFacilityOrganizationId(UUID organizationId);

    // DATA_ENTRY: filter by assigned facility IDs only
    List<Scope1> findByFacilityIdIn(List<UUID> facilityIds);

    List<Scope1> findByFacilityIdInAndStatus(List<UUID> facilityIds, String status);

    List<Scope1> findBySubmissionId(UUID submissionId);

    @Modifying
    void deleteBySubmissionId(UUID submissionId);

    @Query("SELECT COALESCE(SUM(s.calculatedEmission), 0) FROM Scope1 s WHERE s.facility.organization.id = :organizationId AND s.reportingYear.id = :reportingYearId AND s.status IN :statuses")
    BigDecimal sumCalculatedEmission(@Param("organizationId") UUID organizationId,
                                     @Param("reportingYearId") UUID reportingYearId,
                                     @Param("statuses") Collection<String> statuses);

    @Query("SELECT s.facility.id, s.facility.name, COALESCE(SUM(s.calculatedEmission), 0) FROM Scope1 s WHERE s.facility.organization.id = :organizationId AND s.reportingYear.id = :reportingYearId AND s.status IN :statuses GROUP BY s.facility.id, s.facility.name")
    List<Object[]> sumCalculatedEmissionByFacility(@Param("organizationId") UUID organizationId,
                                                   @Param("reportingYearId") UUID reportingYearId,
                                                   @Param("statuses") Collection<String> statuses);

    long countByFacilityOrganizationIdAndReportingYearId(UUID organizationId, UUID reportingYearId);

    long countByFacilityOrganizationIdAndReportingYearIdAndStatus(UUID organizationId, UUID reportingYearId, String status);

    long countByFacilityOrganizationIdAndReportingYearIdAndEmissionFactorIsNotNullAndCalculatedEmissionIsNotNull(UUID organizationId, UUID reportingYearId);
}
