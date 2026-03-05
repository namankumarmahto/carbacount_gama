package com.carbacount.audit.controller;

import com.carbacount.audit.entity.AuditLog;
import com.carbacount.audit.repository.AuditLogRepository;
import com.carbacount.common.response.ApiResponse;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'DATA_ENTRY', 'VIEWER')")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private OrganizationUserRepository orgUserRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLogs() {
        try {
            UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            User user = userRepository.findByEmail(principal.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UUID orgId = orgUserRepository.findByUserId(user.getId()).stream()
                    .findFirst()
                    .map(ou -> ou.getOrganization().getId())
                    .orElseThrow(() -> new RuntimeException("Org not found"));

            List<AuditLog> logs = auditLogRepository.findByOrganizationId(orgId);
            // Sort newest first
            logs.sort(Comparator.comparing(AuditLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

            List<Map<String, Object>> response = logs.stream().map(log -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", log.getId());
                m.put("user", log.getUser() != null ? log.getUser().getFullName() : "System");
                m.put("action", log.getAction());
                m.put("module", log.getModule());
                m.put("createdAt", log.getCreatedAt());
                return m;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Audit logs fetched", response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
