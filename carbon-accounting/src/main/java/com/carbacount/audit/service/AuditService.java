package com.carbacount.audit.service;

import com.carbacount.audit.entity.AuditLog;
import com.carbacount.audit.repository.AuditLogRepository;
import com.carbacount.organization.entity.Organization;
import com.carbacount.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void log(Organization organization, User user, String action, String module) {
        AuditLog log = AuditLog.builder()
                .organization(organization)
                .user(user)
                .action(action)
                .module(module)
                .build();
        auditLogRepository.save(log);
    }
}
