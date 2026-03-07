package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.ProductionData;
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
public interface ProductionDataRepository extends JpaRepository<ProductionData, UUID> {

    List<ProductionData> findByFacilityOrganizationId(UUID organizationId);

    List<ProductionData> findByFacilityOrganizationIdAndStatus(UUID organizationId, String status);

    // DATA_ENTRY: filter by assigned facility IDs only
    List<ProductionData> findByFacilityIdIn(List<UUID> facilityIds);

    List<ProductionData> findByFacilityIdInAndStatus(List<UUID> facilityIds, String status);

    List<ProductionData> findBySubmissionId(UUID submissionId);

    @Modifying
    void deleteBySubmissionId(UUID submissionId);

    @Query("SELECT COALESCE(SUM(p.totalProduction), 0) FROM ProductionData p WHERE p.facility.organization.id = :organizationId AND p.reportingYear.id = :reportingYearId AND p.status IN :statuses")
    BigDecimal sumTotalProduction(@Param("organizationId") UUID organizationId,
                                  @Param("reportingYearId") UUID reportingYearId,
                                  @Param("statuses") Collection<String> statuses);
}
