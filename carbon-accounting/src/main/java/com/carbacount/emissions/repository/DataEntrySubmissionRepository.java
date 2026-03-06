package com.carbacount.emissions.repository;

import com.carbacount.emissions.entity.DataEntrySubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DataEntrySubmissionRepository extends JpaRepository<DataEntrySubmission, UUID> {
    List<DataEntrySubmission> findByOrganizationId(UUID organizationId);

    List<DataEntrySubmission> findByOrganizationIdAndStatus(UUID organizationId, String status);

    List<DataEntrySubmission> findByOrganizationIdAndSubmittedById(UUID organizationId, UUID submittedBy);

    List<DataEntrySubmission> findByOrganizationIdAndSubmittedByIdAndStatus(UUID organizationId, UUID submittedBy, String status);

    List<DataEntrySubmission> findByFacilityIdInAndSubmittedById(List<UUID> facilityIds, UUID submittedBy);

    List<DataEntrySubmission> findByFacilityIdInAndSubmittedByIdAndStatus(List<UUID> facilityIds, UUID submittedBy, String status);

    Optional<DataEntrySubmission> findByIdAndOrganizationId(UUID id, UUID organizationId);

    List<DataEntrySubmission> findByOrganizationIdAndReportingYearId(UUID organizationId, UUID reportingYearId);
}
