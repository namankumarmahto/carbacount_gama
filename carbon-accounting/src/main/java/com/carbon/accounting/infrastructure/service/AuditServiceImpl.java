package com.carbon.accounting.infrastructure.service;

import com.carbon.accounting.core.domain.model.AuditLog;
import com.carbon.accounting.core.domain.service.AuditService;
import com.carbon.accounting.core.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditServiceImpl implements AuditService {

    private final AuditRepository auditRepository;

    @Override
    @Async
    public void logAction(UUID tenantId, String userId, String action, String resource, String resourceId,
            String details) {
        log.info("Logging audit action: {} on resource: {} by user: {}", action, resource, userId);

        AuditLog auditLog = AuditLog.builder()
                .id(UUID.randomUUID())
                .tenantId(tenantId)
                .userId(userId)
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .details(details)
                .ipAddress(null) // Can be extended to capture IP from request context
                .timestamp(Instant.now())
                .build();

        auditRepository.save(auditLog);
    }
}
