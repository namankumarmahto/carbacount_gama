package com.carbacount.emissions.service;

import com.carbacount.audit.service.AuditService;
import com.carbacount.common.exception.FacilityAccessDeniedException;
import com.carbacount.common.service.FileStorageService;
import com.carbacount.emissions.dto.*;
import com.carbacount.emissions.dto.EditableSubmissionResponse;
import com.carbacount.emissions.entity.*;
import com.carbacount.emissions.repository.*;
import com.carbacount.emissions.entity.ProductionData;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.facility.service.FacilityService;
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

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataEntryService {
    private static final String REVIEW_PENDING = "PENDING_REVIEW";
    private static final String REVIEW_NEEDS_CORRECTION = "NEEDS_CORRECTION";
    private static final String REVIEW_VERIFIED = "VERIFIED";

    @Autowired
    private Scope1Repository scope1Repo;
    @Autowired
    private Scope2Repository scope2Repo;
    @Autowired
    private Scope3ActivityRepository scope3Repo;
    @Autowired
    private ProductionDataRepository productionRepo;
    @Autowired
    private DataEntrySubmissionRepository submissionRepo;
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
    private FacilityService facilityService;
    @Autowired
    private AuditService auditService;
    @Autowired
    private EmissionFactorRepository emissionFactorRepo;
    @Autowired
    private SubmissionDocumentRepository documentRepo;
    @Autowired
    private com.carbacount.common.service.FileStorageService fileStorageService;

    // ── Private helpers ────────────────────────────────────────────────────

    private UserPrincipal currentPrincipal() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private User currentUser() {
        return userRepo.findById(currentPrincipal().getId())
                .orElseGet(() -> userRepo.findByEmail(currentPrincipal().getUsername())
                        .orElseThrow(() -> new RuntimeException("Authenticated user not found")));
    }

    private Organization currentOrg() {
        UserPrincipal principal = currentPrincipal();
        if (principal.isOrgScoped() && principal.getOrganizationId() != null) {
            return orgRepo.findById(principal.getOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Organization not found for org-scoped token"));
        }
        User user = currentUser();
        return orgUserRepo.findByUserId(user.getId()).stream()
                .findFirst()
                .map(ou -> ou.getOrganization())
                .orElseThrow(() -> new RuntimeException("Organization not found for user"));
    }

    /** Returns true when the current user has the DATA_ENTRY role. */
    private boolean isDataEntryUser() {
        return currentPrincipal().getAuthorities().stream()
                .anyMatch(a -> "ROLE_DATA_ENTRY".equals(a.getAuthority()));
    }

    @Transactional(readOnly = true)
    public RealtimeEmissionResponse calculateEmission(RealtimeEmissionRequest req) {
        if (req.getQuantity() == null || req.getQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Quantity must be zero or positive");
        }

        if (req.getFacilityId() == null) {
            throw new IllegalArgumentException("Facility is required");
        }

        Facility facility = facilityRepo.findById(req.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facilityService.assertCanAccessFacility(req.getFacilityId());

        EmissionFactor factor = resolveEmissionFactor(req, facility);
        BigDecimal calculated = req.getQuantity()
                .multiply(factor.getFactorValue())
                .setScale(6, RoundingMode.HALF_UP);

        return RealtimeEmissionResponse.builder()
                .emissionFactor(factor.getFactorValue())
                .calculatedEmission(calculated)
                .build();
    }

    private EmissionFactor resolveEmissionFactor(RealtimeEmissionRequest req, Facility facility) {
        String country = facility.getCountry() != null && !facility.getCountry().isBlank()
                ? facility.getCountry().trim()
                : "India";
        String industry = currentOrg().getIndustryType();
        String unit = req.getUnit() == null ? null : req.getUnit().trim();
        String fuelType = req.getFuelType() == null ? null : req.getFuelType().trim();
        String electricitySource = req.getElectricitySource() == null ? null : req.getElectricitySource().trim();
        String category = req.getCategory() == null ? null : req.getCategory().trim();
        String subCategory = req.getSubCategory() == null ? null : req.getSubCategory().trim();
        String scope = req.getScope() == null ? null : req.getScope().trim().toUpperCase();
        String sourceName = null;
        if ("SCOPE1".equals(scope)) {
            sourceName = fuelType;
        } else if ("SCOPE2".equals(scope)) {
            sourceName = electricitySource;
        } else if ("SCOPE3".equals(scope)) {
            sourceName = subCategory != null && !subCategory.isBlank() ? subCategory : category;
        }

        if (scope != null && sourceName != null && unit != null) {
            List<EmissionFactor> industryMatches = emissionFactorRepo.findLatestFactorCandidates(
                    scope, sourceName, unit, null, country, industry);
            if (!industryMatches.isEmpty()) {
                return industryMatches.get(0);
            }
        }

        Optional<EmissionFactor> result = Optional.empty();
        if (scope != null && sourceName != null) {
            result = emissionFactorRepo
                    .findTopByCountryAndScopeTypeAndSourceNameIgnoreCaseAndUnitIgnoreCaseOrderByFactorYearDesc(
                            country, scope, sourceName, unit == null ? "" : unit);
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByCountryAndScopeTypeAndSourceNameIgnoreCaseOrderByFactorYearDesc(
                        country, scope, sourceName);
            }
            if (result.isEmpty()) {
                result = emissionFactorRepo
                        .findTopByScopeTypeAndSourceNameIgnoreCaseAndUnitIgnoreCaseOrderByFactorYearDesc(
                                scope, sourceName, unit == null ? "" : unit);
            }
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByScopeTypeAndSourceNameIgnoreCaseOrderByFactorYearDesc(scope,
                        sourceName);
            }
        }

        if (result.isEmpty() && "SCOPE1".equals(scope) && fuelType != null) {
            result = emissionFactorRepo.findTopByCountryAndFuelTypeAndUnitIgnoreCaseOrderByFactorYearDesc(
                    country, fuelType, unit == null ? "" : unit);
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByCountryAndFuelTypeIgnoreCaseOrderByFactorYearDesc(country,
                        fuelType);
            }
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByFuelTypeIgnoreCaseOrderByFactorYearDesc(fuelType);
            }
        } else if (result.isEmpty() && "SCOPE2".equals(scope) && electricitySource != null) {
            result = emissionFactorRepo.findTopByCountryAndElectricitySourceAndUnitIgnoreCaseOrderByFactorYearDesc(
                    country, electricitySource, unit == null ? "" : unit);
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByCountryAndElectricitySourceIgnoreCaseOrderByFactorYearDesc(country,
                        electricitySource);
            }
            if (result.isEmpty()) {
                result = emissionFactorRepo
                        .findTopByElectricitySourceIgnoreCaseOrderByFactorYearDesc(electricitySource);
            }
        } else if (result.isEmpty() && "SCOPE3".equals(scope) && category != null) {
            result = emissionFactorRepo.findTopByCountryAndFuelTypeAndUnitIgnoreCaseOrderByFactorYearDesc(
                    country, category, unit == null ? "" : unit);
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByCountryAndFuelTypeIgnoreCaseOrderByFactorYearDesc(country,
                        category);
            }
            if (result.isEmpty()) {
                result = emissionFactorRepo.findTopByFuelTypeIgnoreCaseOrderByFactorYearDesc(category);
            }
            if (result.isEmpty() && subCategory != null) {
                result = emissionFactorRepo.findTopByCountryAndFuelTypeAndUnitIgnoreCaseOrderByFactorYearDesc(
                        country, subCategory, unit == null ? "" : unit);
                if (result.isEmpty()) {
                    result = emissionFactorRepo.findTopByCountryAndFuelTypeIgnoreCaseOrderByFactorYearDesc(country,
                            subCategory);
                }
                if (result.isEmpty()) {
                    result = emissionFactorRepo.findTopByFuelTypeIgnoreCaseOrderByFactorYearDesc(subCategory);
                }
            }
        }

        return result.orElseThrow(() -> new RuntimeException("Emission factor not found for selected activity"));
    }

    // ── SUBMIT data (DATA_ENTRY role) ──────────────────────────────────────

    @Transactional
    public int submitData(DataEntrySubmitRequest req, List<MultipartFile> files) {
        User user = currentUser();
        Organization org = currentOrg();

        Facility facility = facilityRepo.findById(req.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        // ── Security: verify the user is assigned to this facility ────────
        // assertCanAccessFacility throws FacilityAccessDeniedException (403)
        // if the current user is not allowed to submit data for this facility.
        // For OWNER/ADMIN it also verifies the facility belongs to their org.
        facilityService.assertCanAccessFacility(req.getFacilityId());

        // Extra multi-tenant check: facility must belong to user's org
        if (!facility.getOrganization().getId().equals(org.getId())) {
            throw new FacilityAccessDeniedException(req.getFacilityId().toString(),
                    "Facility does not belong to your organization");
        }

        ReportingYear reportingYear = reportingYearRepo.findById(req.getReportingYearId())
                .orElseThrow(() -> new RuntimeException("Reporting year not found"));

        UUID submissionId = UUID.randomUUID();
        LocalDateTime submittedAt = LocalDateTime.now();

        DataEntrySubmission submission = DataEntrySubmission.builder()
                .id(submissionId)
                .organization(org)
                .facility(facility)
                .scopeType(req.getScope())
                .reportingYear(reportingYear)
                .submittedBy(user)
                .status("SUBMITTED")
                .reviewStatus(REVIEW_PENDING)
                .submittedAt(submittedAt)
                .build();
        submissionRepo.save(submission);

        if (files != null) {
            for (MultipartFile file : files) {
                try {
                    String fileUrl = fileStorageService.storeFile(file);
                    SubmissionDocument doc = SubmissionDocument.builder()
                            .id(UUID.randomUUID())
                            .submissionId(submissionId)
                            .fileName(file.getOriginalFilename())
                            .fileType(file.getContentType())
                            .fileUrl(fileUrl)
                            .uploadedBy(user)
                            .build();
                    documentRepo.save(doc);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
                }
            }
        }
        int count = 0;
        BigDecimal totalEmission = BigDecimal.ZERO;

        if ("SCOPE1".equals(req.getScope()) && req.getFuelRows() != null) {
            for (FuelRowRequest row : req.getFuelRows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE1")
                        .fuelType(row.getFuelType())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope1Repo.save(Scope1.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .fuelType(row.getFuelType())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
                count++;
            }
        }

        if ("SCOPE2".equals(req.getScope()) && req.getElectricityRows() != null) {
            for (ElectricityRowRequest row : req.getElectricityRows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE2")
                        .electricitySource(row.getElectricitySource())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope2Repo.save(Scope2.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .electricitySource(row.getElectricitySource())
                        .unit(row.getUnit() != null ? row.getUnit() : "kWh")
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
                count++;
            }
        }

        if ("SCOPE3".equals(req.getScope()) && req.getScope3Rows() != null) {
            for (Scope3RowRequest row : req.getScope3Rows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE3")
                        .category(row.getCategory())
                        .subCategory(row.getSubCategory())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope3Repo.save(Scope3Activity.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .category(row.getCategory())
                        .subCategory(row.getSubCategory())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
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
                    .submissionId(submissionId)
                    .totalProduction(pd.getTotalProduction())
                    .unit(pd.getUnit() != null ? pd.getUnit() : "ton")
                    .status("SUBMITTED")
                    .submittedAt(submittedAt)
                    .createdBy(user)
                    .build());
            count++;
        }
        submission.setTotalEmission(totalEmission);
        submissionRepo.save(submission);

        auditService.log(org, user,
                "SUBMITTED_" + req.getScope() + "_DATA: " + count + " records for facility " + facility.getName(),
                "DATA_ENTRY");
        return count;
    }

    // ── FETCH submission summaries ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<EmissionRecordResponse> getMySubmissions() {
        User user = currentUser();
        Organization org = currentOrg();
        List<DataEntrySubmission> submissions;

        if (isDataEntryUser()) {
            List<UUID> assignedFacilityIds = facilityService.getAssignedFacilityIds(user.getId());
            if (assignedFacilityIds.isEmpty()) {
                return List.of();
            }
            submissions = submissionRepo.findByFacilityIdInAndSubmittedById(assignedFacilityIds, user.getId());
        } else {
            submissions = submissionRepo.findByOrganizationIdAndSubmittedById(org.getId(), user.getId());
        }
        return buildSubmissionSummaries(submissions);
    }

    @Transactional(readOnly = true)
    public List<EmissionRecordResponse> getPendingRecords() {
        Organization org = currentOrg();
        return buildSubmissionSummaries(
                submissionRepo.findByOrganizationIdAndReviewStatus(org.getId(), REVIEW_PENDING));
    }

    @Transactional(readOnly = true)
    public List<EmissionRecordResponse> getAllRecords() {
        Organization org = currentOrg();
        return buildSubmissionSummaries(submissionRepo.findByOrganizationId(org.getId()));
    }

    @Transactional(readOnly = true)
    public List<EmissionRecordResponse> getApprovedRecords() {
        Organization org = currentOrg();
        return buildSubmissionSummaries(
                submissionRepo.findByOrganizationIdAndReviewStatus(org.getId(), REVIEW_VERIFIED));
    }

    @Transactional(readOnly = true)
    public List<EmissionRecordResponse> getSubmissionDetails(UUID submissionId) {
        User user = currentUser();
        Organization org = currentOrg();

        DataEntrySubmission submission = submissionRepo.findByIdAndOrganizationId(submissionId, org.getId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (isDataEntryUser()) {
            List<UUID> assignedFacilityIds = facilityService.getAssignedFacilityIds(user.getId());
            if (!assignedFacilityIds.contains(submission.getFacility().getId())
                    || !submission.getSubmittedBy().getId().equals(user.getId())) {
                throw new FacilityAccessDeniedException(submission.getFacility().getId().toString(),
                        "Submission does not belong to your assigned facilities");
            }
        }

        return buildRowsForSubmission(submission);
    }

    @Transactional(readOnly = true)
    public EditableSubmissionResponse getEditableSubmission(UUID submissionId) {
        DataEntrySubmission submission = getSubmissionWithAccess(submissionId);
        ensureEditableStatus(submission.getStatus(), submission.getReviewStatus(), submissionId);

        EditableSubmissionResponse.EditableSubmissionResponseBuilder builder = EditableSubmissionResponse.builder()
                .submissionId(submission.getId())
                .facilityId(submission.getFacility().getId())
                .reportingYearId(submission.getReportingYear().getId())
                .scope(submission.getScopeType())
                .status(submission.getStatus());

        switch (submission.getScopeType()) {
            case "SCOPE1":
                builder.fuelRows(scope1Repo.findBySubmissionId(submissionId).stream()
                        .map(r -> FuelRowRequest.builder()
                                .fuelType(r.getFuelType())
                                .unit(r.getUnit())
                                .quantity(r.getQuantity())
                                .build())
                        .collect(java.util.stream.Collectors.toList()));
                break;
            case "SCOPE2":
                builder.electricityRows(scope2Repo.findBySubmissionId(submissionId).stream()
                        .map(r -> ElectricityRowRequest.builder()
                                .electricitySource(r.getElectricitySource())
                                .unit(r.getUnit())
                                .quantity(r.getQuantity())
                                .build())
                        .collect(java.util.stream.Collectors.toList()));
                break;
            case "SCOPE3":
                builder.scope3Rows(scope3Repo.findBySubmissionId(submissionId).stream()
                        .map(r -> Scope3RowRequest.builder()
                                .category(r.getCategory())
                                .subCategory(r.getSubCategory())
                                .unit(r.getUnit())
                                .quantity(r.getQuantity())
                                .build())
                        .collect(java.util.stream.Collectors.toList()));
                break;
            case "PRODUCTION": {
                ProductionData row = productionRepo.findBySubmissionId(submissionId).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("Production row not found for submission"));
                builder.productionData(ProductionDataRequest.builder()
                        .totalProduction(row.getTotalProduction())
                        .unit(row.getUnit())
                        .build());
                break;
            }
            default:
                throw new RuntimeException("Unsupported scope type: " + submission.getScopeType());
        }

        return builder.build();
    }

    @Transactional
    public int updateSubmission(UUID submissionId, DataEntrySubmitRequest req) {
        User user = currentUser();
        Organization org = currentOrg();
        DataEntrySubmission submission = getSubmissionWithAccess(submissionId);
        ensureEditableStatus(submission.getStatus(), submission.getReviewStatus(), submissionId);

        String scope = req.getScope() == null ? null : req.getScope().trim().toUpperCase();
        if (scope == null || scope.isBlank()) {
            scope = submission.getScopeType();
        }

        Facility facility = facilityRepo.findById(req.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facilityService.assertCanAccessFacility(req.getFacilityId());
        if (!facility.getOrganization().getId().equals(org.getId())) {
            throw new FacilityAccessDeniedException(req.getFacilityId().toString(),
                    "Facility does not belong to your organization");
        }

        ReportingYear reportingYear = reportingYearRepo.findById(req.getReportingYearId())
                .orElseThrow(() -> new RuntimeException("Reporting year not found"));

        // Clear existing rows for this submission (supports scope changes).
        scope1Repo.deleteBySubmissionId(submissionId);
        scope2Repo.deleteBySubmissionId(submissionId);
        scope3Repo.deleteBySubmissionId(submissionId);
        productionRepo.deleteBySubmissionId(submissionId);

        LocalDateTime submittedAt = LocalDateTime.now();
        int count = 0;
        BigDecimal totalEmission = BigDecimal.ZERO;

        if ("SCOPE1".equals(scope) && req.getFuelRows() != null) {
            for (FuelRowRequest row : req.getFuelRows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE1")
                        .fuelType(row.getFuelType())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope1Repo.save(Scope1.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .fuelType(row.getFuelType())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
                count++;
            }
        } else if ("SCOPE2".equals(scope) && req.getElectricityRows() != null) {
            for (ElectricityRowRequest row : req.getElectricityRows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE2")
                        .electricitySource(row.getElectricitySource())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope2Repo.save(Scope2.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .electricitySource(row.getElectricitySource())
                        .unit(row.getUnit() != null ? row.getUnit() : "kWh")
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .updatedBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
                count++;
            }
        } else if ("SCOPE3".equals(scope) && req.getScope3Rows() != null) {
            for (Scope3RowRequest row : req.getScope3Rows()) {
                RealtimeEmissionResponse calc = calculateEmission(RealtimeEmissionRequest.builder()
                        .facilityId(req.getFacilityId())
                        .scope("SCOPE3")
                        .category(row.getCategory())
                        .subCategory(row.getSubCategory())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .build());
                scope3Repo.save(Scope3Activity.builder()
                        .facility(facility)
                        .reportingYear(reportingYear)
                        .submissionId(submissionId)
                        .category(row.getCategory())
                        .subCategory(row.getSubCategory())
                        .unit(row.getUnit())
                        .quantity(row.getQuantity() == null ? BigDecimal.ZERO : row.getQuantity())
                        .emissionFactor(calc.getEmissionFactor())
                        .calculatedEmission(calc.getCalculatedEmission())
                        .status("SUBMITTED")
                        .submittedAt(submittedAt)
                        .createdBy(user)
                        .build());
                totalEmission = totalEmission.add(calc.getCalculatedEmission());
                count++;
            }
        } else if ("PRODUCTION".equals(scope) && req.getProductionData() != null) {
            ProductionDataRequest pd = req.getProductionData();
            if (pd.getTotalProduction() == null || pd.getTotalProduction().doubleValue() <= 0) {
                throw new IllegalArgumentException("Total production must be a positive number");
            }
            productionRepo.save(ProductionData.builder()
                    .facility(facility)
                    .reportingYear(reportingYear)
                    .submissionId(submissionId)
                    .totalProduction(pd.getTotalProduction())
                    .unit(pd.getUnit() != null ? pd.getUnit() : "ton")
                    .status("SUBMITTED")
                    .submittedAt(submittedAt)
                    .createdBy(user)
                    .build());
            count++;
        } else {
            throw new IllegalArgumentException("Invalid scope or payload for update");
        }

        submission.setFacility(facility);
        submission.setReportingYear(reportingYear);
        submission.setScopeType(scope);
        submission.setStatus("SUBMITTED");
        submission.setReviewStatus(REVIEW_PENDING);
        submission.setSubmittedAt(submittedAt);
        submission.setVerifiedAt(null);
        submission.setVerifiedBy(null);
        submission.setRejectionReason(null);
        submission.setTotalEmission(totalEmission);
        submissionRepo.save(submission);

        auditService.log(org, user,
                "EDIT_SUBMISSION [" + scope + "]: " + submissionId + " (" + count + " rows)",
                "DATA_ENTRY");
        return count;
    }

    @Transactional
    public void deleteSubmission(UUID submissionId) {
        User user = currentUser();
        Organization org = currentOrg();
        DataEntrySubmission submission = getSubmissionWithAccess(submissionId);
        ensureEditableStatus(submission.getStatus(), submission.getReviewStatus(), submissionId);

        scope1Repo.deleteBySubmissionId(submissionId);
        scope2Repo.deleteBySubmissionId(submissionId);
        scope3Repo.deleteBySubmissionId(submissionId);
        productionRepo.deleteBySubmissionId(submissionId);
        submissionRepo.delete(submission);

        auditService.log(org, user,
                "DELETE_SUBMISSION [" + submission.getScopeType() + "]: " + submissionId,
                "DATA_ENTRY");
    }

    private DataEntrySubmission getSubmissionWithAccess(UUID submissionId) {
        User user = currentUser();
        Organization org = currentOrg();
        DataEntrySubmission submission = submissionRepo.findByIdAndOrganizationId(submissionId, org.getId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (isDataEntryUser()) {
            List<UUID> assignedFacilityIds = facilityService.getAssignedFacilityIds(user.getId());
            if (!assignedFacilityIds.contains(submission.getFacility().getId())
                    || !submission.getSubmittedBy().getId().equals(user.getId())) {
                throw new FacilityAccessDeniedException(submission.getFacility().getId().toString(),
                        "Submission does not belong to your assigned facilities");
            }
        }
        return submission;
    }

    private void ensureEditableStatus(String status, String reviewStatus, UUID submissionId) {
        boolean editableByStatus = "DRAFT".equalsIgnoreCase(status);
        boolean editableByReviewStatus = REVIEW_NEEDS_CORRECTION.equalsIgnoreCase(reviewStatus);
        if (!editableByStatus && !editableByReviewStatus) {
            throw new FacilityAccessDeniedException(submissionId.toString(),
                    "Submission is locked. Only DRAFT or NEEDS_CORRECTION submissions can be edited/deleted");
        }
    }

    private List<EmissionRecordResponse> buildSubmissionSummaries(List<DataEntrySubmission> submissions) {
        return submissions.stream()
                .sorted(Comparator.comparing(
                        (DataEntrySubmission s) -> s.getSubmittedAt() != null ? s.getSubmittedAt() : s.getCreatedAt(),
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toSubmissionSummary)
                .collect(Collectors.toList());
    }

    private List<EmissionRecordResponse> buildRowsForSubmission(DataEntrySubmission submission) {
        List<EmissionRecordResponse> details;
        switch (submission.getScopeType()) {
            case "SCOPE1":
                details = scope1Repo.findBySubmissionId(submission.getId()).stream().map(this::toResponse)
                        .collect(java.util.stream.Collectors.toList());
                break;
            case "SCOPE2":
                details = scope2Repo.findBySubmissionId(submission.getId()).stream().map(this::toResponse)
                        .collect(java.util.stream.Collectors.toList());
                break;
            case "SCOPE3":
                details = scope3Repo.findBySubmissionId(submission.getId()).stream().map(this::toResponse)
                        .collect(java.util.stream.Collectors.toList());
                break;
            case "PRODUCTION":
                details = productionRepo.findBySubmissionId(submission.getId()).stream().map(this::toResponse)
                        .collect(java.util.stream.Collectors.toList());
                break;
            default:
                throw new RuntimeException("Unsupported scope type: " + submission.getScopeType());
        }

        List<SubmissionDocumentResponse> documents = documentRepo.findBySubmissionId(submission.getId()).stream()
                .map(this::toDocumentResponse)
                .collect(java.util.stream.Collectors.toList());

        return details.stream()
                .map(r -> {
                    r.setDocuments(documents);
                    return r;
                })
                .sorted(Comparator.comparing(EmissionRecordResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private EmissionRecordResponse toSubmissionSummary(DataEntrySubmission submission) {
        List<SubmissionDocumentResponse> documents = documentRepo.findBySubmissionId(submission.getId()).stream()
                .map(this::toDocumentResponse)
                .collect(java.util.stream.Collectors.toList());

        return EmissionRecordResponse.builder()
                .id(submission.getId())
                .submissionId(submission.getId())
                .scope(submission.getScopeType())
                .type(submission.getScopeType())
                .facilityId(submission.getFacility().getId())
                .facilityName(submission.getFacility().getName())
                .reportingYear(submission.getReportingYear().getYearLabel())
                .status(submission.getStatus())
                .reviewStatus(submission.getReviewStatus())
                .rejectionReason(submission.getRejectionReason())
                .totalEmission(submission.getTotalEmission())
                .submittedBy(submission.getSubmittedBy().getFullName())
                .submittedAt(submission.getSubmittedAt())
                .createdAt(submission.getCreatedAt())
                .verifiedAt(submission.getVerifiedAt())
                .documents(documents)
                .build();
    }

    // ── Entity → DTO converters ────────────────────────────────────────────

    private EmissionRecordResponse toResponse(Scope1 f) {
        return EmissionRecordResponse.builder()
                .id(f.getId())
                .submissionId(f.getSubmissionId())
                .type("FUEL")
                .scope("SCOPE1")
                .facilityId(f.getFacility().getId())
                .facilityName(f.getFacility().getName())
                .reportingYear(f.getReportingYear().getYearLabel())
                .fuelType(f.getFuelType())
                .unit(f.getUnit())
                .quantity(f.getQuantity())
                .emissionFactor(f.getEmissionFactor())
                .calculatedEmission(f.getCalculatedEmission())
                .status(f.getStatus())
                .rejectionReason(f.getRejectionReason())
                .submittedBy(f.getCreatedBy().getFullName())
                .submittedAt(f.getSubmittedAt())
                .createdAt(f.getCreatedAt())
                .verifiedAt(f.getVerifiedAt())
                .documents(f.getSubmissionId() != null
                        ? documentRepo.findBySubmissionId(f.getSubmissionId()).stream()
                                .map(this::toDocumentResponse).collect(java.util.stream.Collectors.toList())
                        : null)
                .build();
    }

    private EmissionRecordResponse toResponse(Scope2 e) {
        return EmissionRecordResponse.builder()
                .id(e.getId())
                .submissionId(e.getSubmissionId())
                .type("ELECTRICITY")
                .scope("SCOPE2")
                .facilityId(e.getFacility().getId())
                .facilityName(e.getFacility().getName())
                .reportingYear(e.getReportingYear().getYearLabel())
                .electricitySource(e.getElectricitySource())
                .unit(e.getUnit())
                .quantity(e.getQuantity())
                .emissionFactor(e.getEmissionFactor())
                .calculatedEmission(e.getCalculatedEmission())
                .status(e.getStatus())
                .rejectionReason(e.getRejectionReason())
                .submittedBy(e.getCreatedBy().getFullName())
                .submittedAt(e.getSubmittedAt())
                .createdAt(e.getCreatedAt())
                .verifiedAt(e.getVerifiedAt())
                .documents(e.getSubmissionId() != null
                        ? documentRepo.findBySubmissionId(e.getSubmissionId()).stream()
                                .map(this::toDocumentResponse).collect(java.util.stream.Collectors.toList())
                        : null)
                .build();
    }

    private EmissionRecordResponse toResponse(Scope3Activity s) {
        return EmissionRecordResponse.builder()
                .id(s.getId())
                .submissionId(s.getSubmissionId())
                .type("SCOPE3")
                .scope("SCOPE3")
                .facilityId(s.getFacility().getId())
                .facilityName(s.getFacility().getName())
                .reportingYear(s.getReportingYear().getYearLabel())
                .category(s.getCategory())
                .subCategory(s.getSubCategory())
                .unit(s.getUnit())
                .quantity(s.getQuantity())
                .emissionFactor(s.getEmissionFactor())
                .calculatedEmission(s.getCalculatedEmission())
                .status(s.getStatus())
                .rejectionReason(s.getRejectionReason())
                .submittedBy(s.getCreatedBy().getFullName())
                .submittedAt(s.getSubmittedAt())
                .createdAt(s.getCreatedAt())
                .verifiedAt(s.getVerifiedAt())
                .documents(s.getSubmissionId() != null
                        ? documentRepo.findBySubmissionId(s.getSubmissionId()).stream()
                                .map(this::toDocumentResponse).collect(java.util.stream.Collectors.toList())
                        : null)
                .build();
    }

    private EmissionRecordResponse toResponse(ProductionData p) {
        return EmissionRecordResponse.builder()
                .id(p.getId())
                .submissionId(p.getSubmissionId())
                .type("PRODUCTION")
                .scope("PRODUCTION")
                .facilityId(p.getFacility().getId())
                .facilityName(p.getFacility().getName())
                .reportingYear(p.getReportingYear().getYearLabel())
                .totalProduction(p.getTotalProduction())
                .unit(p.getUnit())
                .quantity(p.getTotalProduction())
                .status(p.getStatus())
                .rejectionReason(p.getRejectionReason())
                .submittedBy(p.getCreatedBy() != null ? p.getCreatedBy().getFullName() : "")
                .submittedAt(p.getSubmittedAt())
                .createdAt(p.getCreatedAt())
                .verifiedAt(p.getVerifiedAt())
                .documents(p.getSubmissionId() != null
                        ? documentRepo.findBySubmissionId(p.getSubmissionId()).stream()
                                .map(this::toDocumentResponse).collect(java.util.stream.Collectors.toList())
                        : null)
                .build();
    }

    private SubmissionDocumentResponse toDocumentResponse(SubmissionDocument doc) {
        return SubmissionDocumentResponse.builder()
                .id(doc.getId())
                .submissionId(doc.getSubmissionId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileUrl(doc.getFileUrl())
                .uploadedBy(doc.getUploadedBy().getFullName())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    // ── VERIFY a record (VIEWER role) ──────────────────────────────────────

    @Transactional
    public void verifyRecord(UUID recordId, String type, String action, String reason) {
        boolean isAuditor = currentPrincipal().getAuthorities().stream()
                .anyMatch(a -> "ROLE_AUDITOR".equals(a.getAuthority()));
        if (!isAuditor) {
            throw new RuntimeException("Only AUDITOR can verify or reject records");
        }

        User verifier = currentUser();
        Organization org = currentOrg();
        // Map legacy action words to new status
        String newStatus;
        if ("APPROVE".equalsIgnoreCase(action) || "VERIFIED".equalsIgnoreCase(action)) {
            newStatus = "VERIFIED";
        } else {
            newStatus = "REJECTED";
        }

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

    @Transactional
    public void verifySubmission(UUID submissionId, String action, String reason) {
        boolean isAuditor = currentPrincipal().getAuthorities().stream()
                .anyMatch(a -> "ROLE_AUDITOR".equals(a.getAuthority()) || "ROLE_ADMIN".equals(a.getAuthority())
                        || "ROLE_OWNER".equals(a.getAuthority()));
        if (!isAuditor) {
            throw new RuntimeException("Only AUDITOR can verify or reject submissions");
        }

        User verifier = currentUser();
        Organization org = currentOrg();
        DataEntrySubmission submission = submissionRepo.findByIdAndOrganizationId(submissionId, org.getId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Status mapping: VERIFIED, REJECTED, NEEDS_CORRECTION, UNDER_REVIEW,
        // PENDING_REVIEW
        String reviewStatus;
        String rowStatus;

        switch (action.toUpperCase()) {
            case "APPROVE":
            case "VERIFIED":
                reviewStatus = "VERIFIED";
                rowStatus = "VERIFIED";
                break;
            case "REJECT":
            case "REJECTED":
                reviewStatus = "REJECTED";
                rowStatus = "REJECTED";
                break;
            case "NEEDS_CORRECTION":
                reviewStatus = "NEEDS_CORRECTION";
                rowStatus = "NEEDS_CORRECTION";
                break;
            case "UNDER_REVIEW":
                reviewStatus = "UNDER_REVIEW";
                rowStatus = "SUBMITTED"; // Rows remain submitted
                break;
            default:
                reviewStatus = "PENDING_REVIEW";
                rowStatus = "SUBMITTED";
                break;
        }

        submission.setReviewStatus(reviewStatus);
        submission.setVerifiedBy(verifier);
        submission.setVerifiedAt(LocalDateTime.now());
        submission.setRejectionReason(reason);
        submissionRepo.save(submission);

        // Update all rows in this submission
        switch (submission.getScopeType()) {
            case "SCOPE1":
                scope1Repo.findBySubmissionId(submissionId).forEach(r -> {
                    r.setStatus(rowStatus);
                    r.setVerifiedBy(verifier);
                    r.setVerifiedAt(LocalDateTime.now());
                    r.setRejectionReason(reason);
                    scope1Repo.save(r);
                });
                break;
            case "SCOPE2":
                scope2Repo.findBySubmissionId(submissionId).forEach(r -> {
                    r.setStatus(rowStatus);
                    r.setVerifiedBy(verifier);
                    r.setVerifiedAt(LocalDateTime.now());
                    r.setRejectionReason(reason);
                    scope2Repo.save(r);
                });
                break;
            case "SCOPE3":
                scope3Repo.findBySubmissionId(submissionId).forEach(r -> {
                    r.setStatus(rowStatus);
                    r.setVerifiedBy(verifier);
                    r.setVerifiedAt(LocalDateTime.now());
                    r.setRejectionReason(reason);
                    scope3Repo.save(r);
                });
                break;
            case "PRODUCTION":
                productionRepo.findBySubmissionId(submissionId).forEach(r -> {
                    r.setStatus(rowStatus);
                    r.setVerifiedBy(verifier);
                    r.setVerifiedAt(LocalDateTime.now());
                    r.setRejectionReason(reason);
                    productionRepo.save(r);
                });
                break;
        }

        auditService.log(org, verifier,
                "VERIFIED_SUBMISSION: " + submissionId + " status=" + reviewStatus
                        + (reason != null ? " reason=" + reason : ""),
                "VERIFICATION");
    }
}
