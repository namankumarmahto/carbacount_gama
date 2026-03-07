package com.carbacount.config;

import com.carbacount.common.enums.UserStatus;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.user.entity.Role;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.RoleRepository;
import com.carbacount.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Seeds sample organizations and owners for development/testing.
 * Only runs in 'dev' profile.
 */
@Component
@Profile("dev")
public class SampleDataSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(SampleDataSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        try {
            if (organizationRepository.count() > 0) {
                log.info("Sample organizations already exist, skipping seeding.");
                return;
            }

            log.info("Seeding sample data for development...");

            Role ownerRole = roleRepository.findByName("OWNER")
                    .orElseThrow(() -> new RuntimeException("OWNER role not found"));

            // 1. Steel Corp
            User owner1 = createSampleUser("owner1@steelcorp.com", "John Steel");
            Organization org1 = createSampleOrganization("Steel Corp", "Steel", "India", "Maharashtra", owner1);
            linkOwner(org1, owner1, ownerRole);

            // 2. Green Energy Ltd
            User owner2 = createSampleUser("owner2@greenenergy.com", "Sarah Green");
            Organization org2 = createSampleOrganization("Green Energy Ltd", "Power", "India", "Gujarat", owner2);
            linkOwner(org2, owner2, ownerRole);

            log.info("Sample data seeded successfully.");
        } catch (Exception e) {
            log.error("Failed to seed sample data: {}", e.getMessage(), e);
        }
    }

    private User createSampleUser(String email, String fullName) {
        User user = User.builder()
                .id(UUID.randomUUID())
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode("Owner@12345"))
                .status(UserStatus.ACTIVE)
                .build();
        return userRepository.save(user);
    }

    private Organization createSampleOrganization(String name, String industryType, String country, String state,
            User creator) {
        Organization org = Organization.builder()
                .id(UUID.randomUUID())
                .name(name)
                .industryType(industryType)
                .country(country)
                .state(state)
                .city("Sample City")
                .createdBy(creator)
                .build();
        return organizationRepository.save(org);
    }

    private void linkOwner(Organization org, User user, Role role) {
        OrganizationUser mapping = OrganizationUser.builder()
                .id(UUID.randomUUID())
                .organization(org)
                .user(user)
                .role(role)
                .build();
        organizationUserRepository.save(mapping);
    }
}
