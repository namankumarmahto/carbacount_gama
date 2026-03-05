package com.carbacount.reporting.repository;

import com.carbacount.reporting.entity.ReportingYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportingYearRepository extends JpaRepository<ReportingYear, UUID> {
    List<ReportingYear> findByOrganizationId(UUID organizationId);
}
