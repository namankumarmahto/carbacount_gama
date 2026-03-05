package com.carbacount.auditor.service;

import com.carbacount.audit.service.AuditService;
import com.carbacount.auditor.dto.VerificationRecordDTO;
import com.carbacount.auditor.dto.VerifyActionRequest;
import com.carbacount.emissions.entity.ProductionData;
import com.carbacount.emissions.entity.Scope1;
import com.carbacount.emissions.entity.Scope2;
import com.carbacount.emissions.entity.Scope3Activity;
import com.carbacount.emissions.repository.ProductionDataRepository;
import com.carbacount.emissions.repository.Scope1Repository;
import com.carbacount.emissions.repository.Scope2Repository;
import com.carbacount.emissions.repository.Scope3ActivityRepository;
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
import java.util.stream.Collectors;

@Service
public class AuditorService {

    @Autowired
    private Scope1Repository scope1Repository;
    @Autowired
    private Scope2Repository scope2Repository;
    @Autowired
    private Scope3ActivityRepository scope3ActivityRepository;
    @Autowired
    private ProductionDataRepository productionDataRepository;
    @Autowired
    private OrganizationUserRepository organizationUserRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuditService auditService;

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

    /**
     * Returns all SUBMITTED records across all scopes for AUDITOR review.
     */
    @Transactional(readOnly = true)
    public List<VerificationRecordDTO> getSubmittedRecords() {
        Organization org = getOrganizationForCurrentUser();
        UUID orgId = org.getId();
        List<VerificationRecordDTO> records = new ArrayList<>();

        // Scope 1
        scope1Repository.findByFacilityOrganizationIdAndStatus(orgId, "SUBMITTED").forEach(s -> {
            records.add(VerificationRecordDTO.builder()
                    .id(s.getId())
                    .type("SCOPE1")
                    .facilityName(s.getFacility().getName())
                    .facilityId(s.getFacility().getId())
                    .reportingYear(s.getReportingYear().getYearLabel())
                    .status(s.getStatus())
                    .submittedByEmail(s.getCreatedBy().getEmail())
                    .submittedAt(s.getSubmittedAt())
                    .createdAt(s.getCreatedAt())
                    .fuelType(s.getFuelType())
                    .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                    .unit(s.getUnit())
                    .rejectionReason(s.getRejectionReason())
                    .build());
        });

        // Scope 2
        scope2Repository.findByFacilityOrganizationIdAndStatus(orgId, "SUBMITTED").forEach(s -> {
            records.add(VerificationRecordDTO.builder()
                    .id(s.getId())
                    .type("SCOPE2")
                    .facilityName(s.getFacility().getName())
                    .facilityId(s.getFacility().getId())
                    .reportingYear(s.getReportingYear().getYearLabel())
                    .status(s.getStatus())
                    .submittedByEmail(s.getCreatedBy().getEmail())
                    .submittedAt(s.getSubmittedAt())
                    .createdAt(s.getCreatedAt())
                    .electricitySource(s.getElectricitySource())
                    .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                    .unit(s.getUnit())
                    .rejectionReason(s.getRejectionReason())
                    .build());
        });

        // Scope 3
        scope3ActivityRepository.findByFacilityOrganizationIdAndStatus(orgId, "SUBMITTED").forEach(s -> {
            records.add(VerificationRecordDTO.builder()
                    .id(s.getId())
                    .type("SCOPE3")
                    .facilityName(s.getFacility().getName())
                    .facilityId(s.getFacility().getId())
                    .reportingYear(s.getReportingYear().getYearLabel())
                    .status(s.getStatus())
                    .submittedByEmail(s.getCreatedBy().getEmail())
                    .submittedAt(s.getSubmittedAt())
                    .createdAt(s.getCreatedAt())
                    .category(s.getCategory())
                    .quantity(s.getQuantity() != null ? s.getQuantity().doubleValue() : null)
                    .unit(s.getUnit())
                    .rejectionReason(s.getRejectionReason())
                    .build());
        });

        // Production
        productionDataRepository.findByFacilityOrganizationIdAndStatus(orgId, "SUBMITTED").forEach(p -> {
            records.add(VerificationRecordDTO.builder()
                    .id(p.getId())
                    .type("PRODUCTION")
                    .facilityName(p.getFacility().getName())
                    .facilityId(p.getFacility().getId())
                    .reportingYear(p.getReportingYear().getYearLabel())
                    .status(p.getStatus())
                    .submittedByEmail(p.getCreatedBy() != null ? p.getCreatedBy().getEmail() : "—")
                    .submittedAt(p.getSubmittedAt())
                    .createdAt(p.getCreatedAt())
                    .totalProduction(p.getTotalProduction() != null ? p.getTotalProduction().doubleValue() : null)
                    .unit(p.getUnit())
                    .rejectionReason(p.getRejectionReason())
                    .build());
        });

        records.sort(Comparator.comparing(r -> r.getSubmittedAt() != null ? r.getSubmittedAt() : r.getCreatedAt(),
                Comparator.nullsLast(Comparator.reverseOrder())));
        return records;
    }

    /**
     * Auditor approves (VERIFIED) or rejects (REJECTED) a specific emission record.
     */
    @Transactional
    public void verifyRecord(UUID recordId, VerifyActionRequest request) {
        User auditor = getCurrentUser();
        Organization org = getOrganizationForCurrentUser();

        String action = request.getAction().toUpperCase();
        if (!"VERIFIED".equals(action) && !"REJECTED".equals(action)) {
            throw new IllegalArgumentException("Action must be VERIFIED or REJECTED");
        }
        if ("REJECTED".equals(action) && (request.getReason() == null || request.getReason().isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        LocalDateTime now = LocalDateTime.now();
        String type = request.getType().toUpperCase();

        switch (type) {
            case "SCOPE1" -> {
                Scope1 s1 = scope1Repository.findById(recordId)
                        .orElseThrow(() -> new RuntimeException("Scope1 record not found"));
                validateSubmitted(s1.getStatus(), recordId);
                s1.setStatus(action);
                s1.setVerifiedBy(auditor);
                s1.setVerifiedAt(now);
                if ("REJECTED".equals(action))
                    s1.setRejectionReason(request.getReason());
                scope1Repository.save(s1);
            }
            case "SCOPE2" -> {
                Scope2 s2 = scope2Repository.findById(recordId)
                        .orElseThrow(() -> new RuntimeException("Scope2 record not found"));
                validateSubmitted(s2.getStatus(), recordId);
                s2.setStatus(action);
                s2.setVerifiedBy(auditor);
                s2.setVerifiedAt(now);
                if ("REJECTED".equals(action))
                    s2.setRejectionReason(request.getReason());
                scope2Repository.save(s2);
            }
            case "SCOPE3" -> {
                Scope3Activity s3 = scope3ActivityRepository.findById(recordId)
                        .orElseThrow(() -> new RuntimeException("Scope3 record not found"));
                validateSubmitted(s3.getStatus(), recordId);
                s3.setStatus(action);
                s3.setVerifiedBy(auditor);
                s3.setVerifiedAt(now);
                if ("REJECTED".equals(action))
                    s3.setRejectionReason(request.getReason());
                scope3ActivityRepository.save(s3);
            }
            case "PRODUCTION" -> {
                ProductionData pd = productionDataRepository.findById(recordId)
                        .orElseThrow(() -> new RuntimeException("Production record not found"));
                validateSubmitted(pd.getStatus(), recordId);
                pd.setStatus(action);
                pd.setVerifiedBy(auditor);
                pd.setVerifiedAt(now);
                if ("REJECTED".equals(action))
                    pd.setRejectionReason(request.getReason());
                productionDataRepository.save(pd);
            }
            default -> throw new IllegalArgumentException("Unknown record type: " + type);
        }

        auditService.log(org, auditor,
                action + "_RECORD [" + type + "]: " + recordId,
                "VERIFICATION");
    }

    private void validateSubmitted(String status, UUID id) {
        if (!"SUBMITTED".equals(status)) {
            throw new RuntimeException("Record " + id + " is not in SUBMITTED status (current: " + status + ")");
        }
    }
}
