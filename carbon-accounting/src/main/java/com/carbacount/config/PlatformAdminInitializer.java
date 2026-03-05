package com.carbacount.config;

import com.carbacount.common.enums.UserStatus;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Ensures the platform ADMIN user exists with the correct password hash.
 * This runner validates the admin user on every startup, re-hashing if needed.
 *
 * The admin user is seeded via V5 migration but the password hash is
 * pre-computed.
 * This runner ensures the hash is always valid.
 */
@Component
public class PlatformAdminInitializer implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(PlatformAdminInitializer.class);

    private static final UUID ADMIN_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    @Value("${app.platformAdminEmail:admin@carbacount.com}")
    private String adminEmail;

    @Value("${app.platformAdminDefaultPassword:Admin@12345}")
    private String adminDefaultPassword;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            userRepository.findByEmail(adminEmail).ifPresentOrElse(existingAdmin -> {
                // Admin exists — always ensure password matches default for the platform level
                // admin
                // In production, this would be more secure, but for seeding/dev this ensures
                // access.
                log.info("Platform ADMIN user found — ensuring password hash is up to date");
                existingAdmin.setPasswordHash(passwordEncoder.encode(adminDefaultPassword));
                existingAdmin.setStatus(UserStatus.ACTIVE);
                userRepository.save(existingAdmin);
                log.info("Platform ADMIN user verified and password reset: {}", adminEmail);
            }, () -> {
                log.warn("Platform ADMIN user not found — creating via ApplicationRunner");
                User admin = User.builder()
                        .id(ADMIN_USER_ID)
                        .fullName("Platform Administrator")
                        .email(adminEmail)
                        .passwordHash(passwordEncoder.encode(adminDefaultPassword))
                        .status(UserStatus.ACTIVE)
                        .build();
                userRepository.save(admin);
                log.info("Platform ADMIN user created successfully: {}", adminEmail);
            });
        } catch (Exception e) {
            log.error("Failed to initialize platform ADMIN user: {}", e.getMessage(), e);
        }
    }
}
