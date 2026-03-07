package com.carbacount.auditor.service;

import com.carbacount.audit.service.AuditService;
import com.carbacount.auditor.dto.VerificationRecordDTO;
import com.carbacount.auditor.dto.VerifyActionRequest;
import com.carbacount.emissions.entity.ProductionData;
import com.carbacount.emissions.entity.Scope1;
import com.carbacount.emissions.entity.Scope2;
import com.carbacount.emissions.entity.Scope3Activity;
import com.carbacount.emissions.entity.DataEntrySubmission;
import com.carbacount.emissions.repository.DataEntrySubmissionRepository;
import com.carbacount.emissions.repository.ProductionDataRepository;
import com.carbacount.emissions.repository.Scope1Repository;
import com.carbacount.emissions.repository.Scope2Repository;
import com.carbacount.emissions.repository.Scope3ActivityRepository;
import com.carbacount.emissions.repository.SubmissionDocumentRepository;
import com.carbacount.emissions.dto.SubmissionDocumentResponse;
import com.carbacount.emissions.entity.SubmissionDocument;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuditorService {
    private static final Set<String> ALLOWED_REVIEW_STATUSES = Set.of(
            "PENDING_REVIEW", "UNDER_REVIEW", "VERIFIED", "NEEDS_CORRECTION", "REJECTED");

    @Autowired
    private Scope1Repository scope1Repository;
    @Autowired
    private Scope2Repository scope2Repository;
    @Autowired
    private Scope3ActivityRepository scope3ActivityRepository;
    @Autowired
    private ProductionDataRepository productionDataRepository;
    @Autowired
    private DataEntrySubmissionRepository submissionRepository;
    @Autowired
    private OrganizationUserRepository organizationUserRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuditService auditService;
    @Autowired
    private SubmissionDocumentRepository documentRepo;

    private User getCurrentUser() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Organization getOrganizationForCurrentUser() {
        User user = getCurrentUser();
        List<OrganizationUser> orgUsers = organizationUserRepository.findByUser(user);
        if (orgUsers.isEmpty()) {
            throw new RuntimeException("User is not associated with any organization");
        }
        return orgUsers.get(0).getOrganization();
    }

    @Transactional(readOnly = true)
    public List<VerificationRecordDTO> getRecordsByReviewStatus(String reviewStatus) {
        Organization org = getOrganizationForCurrentUser();
        UUID orgId = org.getId();
        List<VerificationRecordDTO> records = new ArrayList<>();
        String normalized = normalizeReviewStatus(reviewStatus);
        List<DataEntrySubmission> submissions = submissionRepository
                .findByOrganizationIdAndReviewStatus(orgId, normalized);

        submissions.forEach(submission -> {
            UUID submissionId = submission.getId();
            final String currentReviewStatus = submission.getReviewStatus();
            final List<SubmissionDocumentResponse> docs = new ArrayList<>();
            documentRepo.findBySubmissionId(submissionId).forEach(d -> docs.add(toDocumentResponse(d)));

            switch (submission.getScopeType()) {
                case "SCOPE1":
                    scope1Repository.findBySubmissionId(submissionId).forEach(s -> records.add(VerificationRecordDTO
                            .builder()
                            .id(s.getId())
                            .submissionId(s.getSubmissionId())
                            .type("SCOPE1")
                            .facilityName(s.getFacility().getName())
                            .facilityId(s.getFacility().getId())
                            .reportingYear(s.getReportingYear().getYearLabel())
                            .status(s.getStatus())
                            .reviewStatus(currentReviewStatus)
                            .submittedByEmail(s.getCreatedBy() != null ? s.getCreatedBy().getEmail() : "—")
                            .submittedAt(s.getSubmittedAt())
                            .createdAt(s.getCreatedAt())
                            .fuelType(s.getFuelType())
                            .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                            .unit(s.getUnit())
                            .emissionFactor(s.getEmissionFactor() != null ? s.getEmissionFactor().doubleValue() : null)
                            .calculatedEmission(
                                    s.getCalculatedEmission() != null ? s.getCalculatedEmission().doubleValue() : null)
                            .rejectionReason(s.getRejectionReason())
                            .documents(docs)
                            .build()));
                    break;
                case "SCOPE2":
                    scope2Repository.findBySubmissionId(submissionId).forEach(s -> records.add(VerificationRecordDTO
                            .builder()
                            .id(s.getId())
                            .submissionId(s.getSubmissionId())
                            .type("SCOPE2")
                            .facilityName(s.getFacility().getName())
                            .facilityId(s.getFacility().getId())
                            .reportingYear(s.getReportingYear().getYearLabel())
                            .status(s.getStatus())
                            .reviewStatus(currentReviewStatus)
                            .submittedByEmail(s.getCreatedBy() != null ? s.getCreatedBy().getEmail() : "—")
                            .submittedAt(s.getSubmittedAt())
                            .createdAt(s.getCreatedAt())
                            .electricitySource(s.getElectricitySource())
                            .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                            .unit(s.getUnit())
                            .emissionFactor(s.getEmissionFactor() != null ? s.getEmissionFactor().doubleValue() : null)
                            .calculatedEmission(
                                    s.getCalculatedEmission() != null ? s.getCalculatedEmission().doubleValue() : null)
                            .rejectionReason(s.getRejectionReason())
                            .documents(docs)
                            .build()));
                    break;
                case "SCOPE3":
                    scope3ActivityRepository.findBySubmissionId(submissionId)
                            .forEach(s -> records.add(VerificationRecordDTO.builder()
                                    .id(s.getId())
                                    .submissionId(s.getSubmissionId())
                                    .type("SCOPE3")
                                    .facilityName(s.getFacility().getName())
                                    .facilityId(s.getFacility().getId())
                                    .reportingYear(s.getReportingYear().getYearLabel())
                                    .status(s.getStatus())
                                    .reviewStatus(currentReviewStatus)
                                    .submittedByEmail(s.getCreatedBy() != null ? s.getCreatedBy().getEmail() : "—")
                                    .submittedAt(s.getSubmittedAt())
                                    .createdAt(s.getCreatedAt())
                                    .category(s.getCategory())
                                    .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                                    .unit(s.getUnit())
                                    .emissionFactor(
                                            s.getEmissionFactor() != null ? s.getEmissionFactor().doubleValue() : null)
                                    .calculatedEmission(
                                            s.getCalculatedEmission() != null ? s.getCalculatedEmission().doubleValue()
                                                    : null)
                                    .rejectionReason(s.getRejectionReason())
                                    .documents(docs)
                                    .build()));
                    break;
                case "PRODUCTION":
                    productionDataRepository.findBySubmissionId(submissionId)
                            .forEach(p -> records.add(VerificationRecordDTO.builder()
                                    .id(p.getId())
                                    .submissionId(p.getSubmissionId())
                                    .type("PRODUCTION")
                                    .facilityName(p.getFacility().getName())
                                    .facilityId(p.getFacility().getId())
                                    .reportingYear(p.getReportingYear().getYearLabel())
                                    .status(p.getStatus())
                                    .reviewStatus(currentReviewStatus)
                                    .submittedByEmail(p.getCreatedBy() != null ? p.getCreatedBy().getEmail() : "—")
                                    .submittedAt(p.getSubmittedAt())
                                    .createdAt(p.getCreatedAt())
                                    .totalProduction(
                                            p.getTotalProduction() != null ? p.getTotalProduction().doubleValue()
                                                    : null)
                                    .unit(p.getUnit())
                                    .rejectionReason(p.getRejectionReason())
                                    .documents(docs)
                                    .build()));
                    break;
                default:
                    throw new IllegalArgumentException("Unknown scope type: " + submission.getScopeType());
            }
        });

        records.sort(Comparator.comparing(r -> r.getSubmittedAt() != null ? r.getSubmittedAt() : r.getCreatedAt(),
                Comparator.nullsLast(Comparator.reverseOrder())));
        return records;
    }

    @Transactional
    public void verifySubmission(UUID submissionId, VerifyActionRequest request) {
        User auditor = getCurrentUser();
        Organization org = getOrganizationForCurrentUser();

        String rs = normalizeReviewStatus(request.getReviewStatus());
        if (rs == null && request.getAction() != null) {
            rs = normalizeReviewStatus(request.getAction());
            if ("REJECTED".equals(rs) && "REJECTED".equalsIgnoreCase(request.getAction())) {
                rs = "REJECTED";
            }
        }
        final String reviewStatus = rs;
        if (reviewStatus == null) {
            throw new IllegalArgumentException("reviewStatus is required");
        }
        if (("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus))
                && (request.getReason() == null || request.getReason().isBlank())) {
            throw new IllegalArgumentException("Reason is required for REJECTED or NEEDS_CORRECTION");
        }

        DataEntrySubmission submission = submissionRepository.findByIdAndOrganizationId(submissionId, org.getId())
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        LocalDateTime now = LocalDateTime.now();
        submission.setReviewStatus(reviewStatus);
        submission.setStatus(mapSubmissionStatus(reviewStatus));
        submission.setVerifiedBy(auditor);
        submission.setVerifiedAt(now);
        if ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus)) {
            submission.setRejectionReason(request.getReason());
        } else {
            submission.setRejectionReason(null);
        }
        submissionRepository.save(submission);

        switch (submission.getScopeType()) {
            case "SCOPE1":
                scope1Repository.findBySubmissionId(submissionId)
                        .forEach(s1 -> applyReviewState(s1, reviewStatus, request.getReason(), auditor, now));
                break;
            case "SCOPE2":
                scope2Repository.findBySubmissionId(submissionId)
                        .forEach(s2 -> applyReviewState(s2, reviewStatus, request.getReason(), auditor, now));
                break;
            case "SCOPE3":
                scope3ActivityRepository.findBySubmissionId(submissionId)
                        .forEach(s3 -> applyReviewState(s3, reviewStatus, request.getReason(), auditor, now));
                break;
            case "PRODUCTION":
                productionDataRepository.findBySubmissionId(submissionId)
                        .forEach(pd -> applyReviewState(pd, reviewStatus, request.getReason(), auditor, now));
                break;
            default:
                throw new IllegalArgumentException("Unknown scope type: " + submission.getScopeType());
        }

        auditService.log(org, auditor,
                "SET_REVIEW_STATUS_" + reviewStatus + " [" + submission.getScopeType() + "]: " + submissionId,
                "VERIFICATION");
    }

    private String normalizeReviewStatus(String reviewStatus) {
        if (reviewStatus == null || reviewStatus.isBlank()) {
            return null;
        }
        String normalized = reviewStatus.trim().toUpperCase(Locale.ROOT);
        if ("SUBMITTED".equals(normalized)) {
            normalized = "PENDING_REVIEW";
        }
        if (!ALLOWED_REVIEW_STATUSES.contains(normalized)) {
            throw new IllegalArgumentException("Invalid reviewStatus: " + reviewStatus);
        }
        return normalized;
    }

    private String mapSubmissionStatus(String reviewStatus) {
        if ("VERIFIED".equals(reviewStatus))
            return "VERIFIED";
        if ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus))
            return "REJECTED";
        return "SUBMITTED";
    }

    private String mapRowStatus(String reviewStatus) {
        if ("VERIFIED".equals(reviewStatus))
            return "VERIFIED";
        if ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus))
            return "REJECTED";
        return "SUBMITTED";
    }

    private void applyReviewState(Scope1 row, String reviewStatus, String reason, User auditor, LocalDateTime now) {
        row.setStatus(mapRowStatus(reviewStatus));
        row.setVerifiedBy(auditor);
        row.setVerifiedAt(now);
        row.setRejectionReason(
                ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus)) ? reason : null);
    }

    private void applyReviewState(Scope2 row, String reviewStatus, String reason, User auditor, LocalDateTime now) {
        row.setStatus(mapRowStatus(reviewStatus));
        row.setVerifiedBy(auditor);
        row.setVerifiedAt(now);
        row.setRejectionReason(
                ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus)) ? reason : null);
    }

    private void applyReviewState(Scope3Activity row, String reviewStatus, String reason, User auditor,
            LocalDateTime now) {
        row.setStatus(mapRowStatus(reviewStatus));
        row.setVerifiedBy(auditor);
        row.setVerifiedAt(now);
        row.setRejectionReason(
                ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus)) ? reason : null);
    }

    private void applyReviewState(ProductionData row, String reviewStatus, String reason, User auditor,
            LocalDateTime now) {
        row.setStatus(mapRowStatus(reviewStatus));
        row.setVerifiedBy(auditor);
        row.setVerifiedAt(now);
        row.setRejectionReason(
                ("REJECTED".equals(reviewStatus) || "NEEDS_CORRECTION".equals(reviewStatus)) ? reason : null);
    }

    private SubmissionDocumentResponse toDocumentResponse(SubmissionDocument doc) {
        return SubmissionDocumentResponse.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileUrl(doc.getFileUrl())
                .uploadedBy(doc.getUploadedBy().getFullName())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
