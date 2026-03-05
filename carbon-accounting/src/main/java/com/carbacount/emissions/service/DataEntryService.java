package com.carbacount.emissions.service;

import com.carbacount.audit.service.AuditService;
import com.carbacount.emissions.dto.*;
import com.carbacount.emissions.entity.*;
import com.carbacount.emissions.repository.*;
import com.carbacount.emissions.entity.ProductionData;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.reporting.entity.ReportingYear;
import com.carbacount.reporting.repository.ReportingYearRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class DataEntryService {

    @Autowired
    private Scope1Repository scope1Repo;
    @Autowired
    private Scope2Repository scope2Repo;
    @Autowired
    private Scope3ActivityRepository scope3Repo;
    @Autowired
    private ProductionDataRepository productionRepo;
    @Autowired
    private FacilityRepository facilityRepo;
    @Autowired
    private ReportingYearRepository reportingYearRepo;
    @Autowired
    private UserRepository userRepo;
    @Autowired
    private OrganizationRepository orgRepo;
    @Autowired
    private OrganizationUserRepository orgUserRepo;
    @Autowired
    private AuditService auditService;

    private UserPrincipal currentPrincipal() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private User currentUser() {
        return userRepo.findByEmail(currentPrincipal().getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private Organization currentOrg() {
        User user = currentUser();
        return orgUserRepo.findByUserId(user.getId()).stream()
                .findFirst()
                .map(ou -> ou.getOrganization())
                .orElseThrow(() -> new RuntimeException("Organization not found for user"));
    }

    // ── SUBMIT data (DATA_ENTRY role) ─────────────────────────────────────────

    @Transactional
    public int submitData(DataEntrySubmitRequest req) {
        User user = currentUser();
        Organization org = currentOrg();

        Facility facility = facilityRepo.findById(req.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        ReportingYear reportingYear = reportingYearRepo.findById(req.getReportingYearId())
                .orElseThrow(() -> new RuntimeException("Reporting year not found"));

        int count = 0;

        if ("SCOPE1".equals(req.getScope()) && req.getFuelRows() != null) {
            for (FuelRowRequest row : req.getFuelRows()) {
                scope1Repo.save(Scope1.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .fuelType(row.getFuelType())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity())
                        .status("PENDING")
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                count++;
            }
        }

        if ("SCOPE2".equals(req.getScope()) && req.getElectricityRows() != null) {
            for (ElectricityRowRequest row : req.getElectricityRows()) {
                scope2Repo.save(Scope2.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .electricitySource(row.getElectricitySource())
                        .unit(row.getUnit() != null ? row.getUnit() : "kWh")
                        .quantity(row.getQuantity())
                        .status("PENDING")
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                count++;
            }
        }

        if ("SCOPE3".equals(req.getScope()) && req.getScope3Rows() != null) {
            for (Scope3RowRequest row : req.getScope3Rows()) {
                scope3Repo.save(Scope3Activity.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .category(row.getCategory())
                        .subCategory(row.getSubCategory())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity())
                        .status("PENDING")
                        .createdBy(user)
                        .build());
                count++;
            }
        }

        if ("PRODUCTION".equals(req.getScope()) && req.getProductionData() != null) {
            ProductionDataRequest pd = req.getProductionData();
            if (pd.getTotalProduction() == null || pd.getTotalProduction().doubleValue() <= 0) {
                throw new IllegalArgumentException("Total production must be a positive number");
            }
            productionRepo.save(ProductionData.builder()
                    .facility(facility)
                    .reportingYear(reportingYear)
                    .totalProduction(pd.getTotalProduction())
                    .unit(pd.getUnit() != null ? pd.getUnit() : "ton")
                    .status("PENDING")
                    .createdBy(user)
                    .build());
            count++;
        }

        auditService.log(org, user,
                "SUBMITTED_" + req.getScope() + "_DATA: " + count + " records for facility " + facility.getName(),
                "DATA_ENTRY");
        return count;
    }

    // ── FETCH records submitted by current user ───────────────────────────────

    public List<EmissionRecordResponse> getMySubmissions() {
        User user = currentUser();
        Organization org = currentOrg();
        return buildResponse(org.getId(), null, user);
    }

    // ── FETCH all PENDING records (VIEWER role sees these) ────────────────────

    public List<EmissionRecordResponse> getPendingRecords() {
        Organization org = currentOrg();
        return buildResponse(org.getId(), "PENDING", null);
    }

    // ── FETCH all records for org (owner/admin dashboard) ─────────────────────

    public List<EmissionRecordResponse> getAllRecords() {
        Organization org = currentOrg();
        return buildResponse(org.getId(), null, null);
    }

    // ── FETCH approved records (for emissions analytics) ──────────────────────

    public List<EmissionRecordResponse> getApprovedRecords() {
        Organization org = currentOrg();
        return buildResponse(org.getId(), "APPROVED", null);
    }

    private List<EmissionRecordResponse> buildResponse(UUID orgId, String status, User filterUser) {
        List<EmissionRecordResponse> result = new ArrayList<>();

        List<Scope1> fuels = status != null
                ? scope1Repo.findByFacilityOrganizationIdAndStatus(orgId, status)
                : scope1Repo.findByFacilityOrganizationId(orgId);
        for (Scope1 f : fuels) {
            if (filterUser != null && !f.getCreatedBy().getId().equals(filterUser.getId()))
                continue;
            result.add(EmissionRecordResponse.builder()
                    .id(f.getId())
                    .type("FUEL")
                    .scope("SCOPE1")
                    .facilityId(f.getFacility().getId())
                    .facilityName(f.getFacility().getName())
                    .fuelType(f.getFuelType())
                    .unit(f.getUnit())
                    .quantity(f.getQuantity())
                    .status(f.getStatus())
                    .rejectionReason(f.getRejectionReason())
                    .submittedBy(f.getCreatedBy().getFullName())
                    .createdAt(f.getCreatedAt())
                    .verifiedAt(f.getVerifiedAt())
                    .build());
        }

        List<Scope2> elecs = status != null
                ? scope2Repo.findByFacilityOrganizationIdAndStatus(orgId, status)
                : scope2Repo.findByFacilityOrganizationId(orgId);
        for (Scope2 e : elecs) {
            if (filterUser != null && !e.getCreatedBy().getId().equals(filterUser.getId()))
                continue;
            result.add(EmissionRecordResponse.builder()
                    .id(e.getId())
                    .type("ELECTRICITY")
                    .scope("SCOPE2")
                    .facilityId(e.getFacility().getId())
                    .facilityName(e.getFacility().getName())
                    .electricitySource(e.getElectricitySource())
                    .unit(e.getUnit())
                    .quantity(e.getQuantity())
                    .status(e.getStatus())
                    .rejectionReason(e.getRejectionReason())
                    .submittedBy(e.getCreatedBy().getFullName())
                    .createdAt(e.getCreatedAt())
                    .verifiedAt(e.getVerifiedAt())
                    .build());
        }

        List<Scope3Activity> s3s = status != null
                ? scope3Repo.findByFacilityOrganizationIdAndStatus(orgId, status)
                : scope3Repo.findByFacilityOrganizationId(orgId);
        for (Scope3Activity s : s3s) {
            if (filterUser != null && !s.getCreatedBy().getId().equals(filterUser.getId()))
                continue;
            result.add(EmissionRecordResponse.builder()
                    .id(s.getId())
                    .type("SCOPE3")
                    .scope("SCOPE3")
                    .facilityId(s.getFacility().getId())
                    .facilityName(s.getFacility().getName())
                    .category(s.getCategory())
                    .subCategory(s.getSubCategory())
                    .unit(s.getUnit())
                    .quantity(s.getQuantity())
                    .status(s.getStatus())
                    .rejectionReason(s.getRejectionReason())
                    .submittedBy(s.getCreatedBy().getFullName())
                    .createdAt(s.getCreatedAt())
                    .verifiedAt(s.getVerifiedAt())
                    .build());
        }

        // ── Production Data ──────────────────────────────────────────────────
        List<ProductionData> productions = status != null
                ? productionRepo.findByFacilityOrganizationIdAndStatus(orgId, status)
                : productionRepo.findByFacilityOrganizationId(orgId);
        for (ProductionData p : productions) {
            if (filterUser != null && p.getCreatedBy() != null
                    && !p.getCreatedBy().getId().equals(filterUser.getId()))
                continue;
            result.add(EmissionRecordResponse.builder()
                    .id(p.getId())
                    .type("PRODUCTION")
                    .scope("PRODUCTION")
                    .facilityId(p.getFacility().getId())
                    .facilityName(p.getFacility().getName())
                    .totalProduction(p.getTotalProduction())
                    .unit(p.getUnit())
                    .quantity(p.getTotalProduction())
                    .status(p.getStatus())
                    .rejectionReason(p.getRejectionReason())
                    .submittedBy(p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : "")
                    .createdAt(p.getCreatedAt())
                    .verifiedAt(p.getVerifiedAt())
                    .build());
        }

        result.sort(Comparator.comparing(EmissionRecordResponse::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    // ── VERIFY a record (VIEWER role) ─────────────────────────────────────────

    @Transactional
    public void verifyRecord(UUID recordId, String type, String action, String reason) {
        User verifier = currentUser();
        Organization org = currentOrg();
        String newStatus = "APPROVE".equalsIgnoreCase(action) ? "APPROVED" : "REJECTED";

        if ("FUEL".equals(type)) {
            Scope1 f = scope1Repo.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Fuel record not found"));
            f.setStatus(newStatus);
            f.setVerifiedBy(verifier);
            f.setVerifiedAt(LocalDateTime.now());
            if ("REJECTED".equals(newStatus))
                f.setRejectionReason(reason);
            scope1Repo.save(f);
        } else if ("ELECTRICITY".equals(type)) {
            Scope2 e = scope2Repo.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Electricity record not found"));
            e.setStatus(newStatus);
            e.setVerifiedBy(verifier);
            e.setVerifiedAt(LocalDateTime.now());
            if ("REJECTED".equals(newStatus))
                e.setRejectionReason(reason);
            scope2Repo.save(e);
        } else if ("SCOPE3".equals(type)) {
            Scope3Activity s = scope3Repo.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Scope3 record not found"));
            s.setStatus(newStatus);
            s.setVerifiedBy(verifier);
            s.setVerifiedAt(LocalDateTime.now());
            if ("REJECTED".equals(newStatus))
                s.setRejectionReason(reason);
            scope3Repo.save(s);
        } else if ("PRODUCTION".equals(type)) {
            ProductionData p = productionRepo.findById(recordId)
                    .orElseThrow(() -> new RuntimeException("Production data record not found"));
            p.setStatus(newStatus);
            p.setVerifiedBy(verifier);
            p.setVerifiedAt(LocalDateTime.now());
            if ("REJECTED".equals(newStatus))
                p.setRejectionReason(reason);
            productionRepo.save(p);
        } else {
            throw new RuntimeException("Unknown record type: " + type);
        }

        auditService.log(org, verifier,
                newStatus + "_RECORD: " + recordId + " (type=" + type + ")"
                        + (reason != null ? " reason=" + reason : ""),
                "VERIFICATION");
    }
}
