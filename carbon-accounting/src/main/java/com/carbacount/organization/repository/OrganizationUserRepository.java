package com.carbacount.organization.repository;

import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationUserRepository extends JpaRepository<OrganizationUser, UUID> {
    List<OrganizationUser> findByUser(User user);

    Optional<OrganizationUser> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);

    List<OrganizationUser> findByOrganizationId(UUID organizationId);

    // Check if an owner already exists for an organization
    boolean existsByOrganizationIdAndRoleName(UUID organizationId, String roleName);

    List<OrganizationUser> findByUserId(UUID userId);

    // Find the user with a specific role in an organization (e.g., OWNER)
    @Query("SELECT ou FROM OrganizationUser ou WHERE ou.organization.id = :orgId AND ou.role.name = :roleName")
    Optional<OrganizationUser> findByOrganizationIdAndRoleName(@Param("orgId") UUID orgId,
            @Param("roleName") String roleName);
}
