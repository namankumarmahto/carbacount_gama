package com.carbacount.owner.service;

import com.carbacount.audit.service.AuditService;
import com.carbacount.auth.service.AuthService;
import com.carbacount.common.enums.FacilityStatus;
import com.carbacount.common.enums.UserRole;
import com.carbacount.common.enums.UserStatus;
import com.carbacount.common.service.EmailService;
import com.carbacount.facility.dto.FacilityDTO;
import com.carbacount.facility.entity.Facility;
import com.carbacount.facility.entity.FacilityUserMapping;
import com.carbacount.facility.repository.FacilityRepository;
import com.carbacount.facility.repository.FacilityUserMappingRepository;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.UserPrincipal;
import com.carbacount.auth.repository.InvitationTokenRepository;
import com.carbacount.user.dto.EditActiveUserRequest;
import com.carbacount.user.dto.EditPendingUserRequest;
import com.carbacount.user.dto.UserInviteRequest;
import com.carbacount.user.dto.UserResponse;
import com.carbacount.user.entity.Role;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.RoleRepository;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OwnerService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private FacilityUserMappingRepository facilityUserMappingRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private AuditService auditService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private InvitationTokenRepository invitationTokenRepository;

    private User getCurrentUser() {
        try {
            UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication()
                    .getPrincipal();
            return userRepository.findById(principal.getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Logged-in user not found in database for ID: " + principal.getId()));
        } catch (Exception e) {
            throw new RuntimeException("Security context error: " + e.getMessage());
        }
    }

    private Organization getOrganizationForCurrentUser() {
        User user = getCurrentUser();
        List<OrganizationUser> orgUsers = organizationUserRepository.findByUser(user);
        if (orgUsers.isEmpty()) {
            throw new RuntimeException("User " + user.getEmail() + " is not associated with any organization.");
        }
        return orgUsers.get(0).getOrganization();
    }

    @Transactional
    public UserResponse inviteUser(UserInviteRequest request) {
        try {
            Organization organization = getOrganizationForCurrentUser();

            // 1. Strict constraint: no second OWNER allowed
            if (request.getRole() == UserRole.OWNER) {
                throw new IllegalArgumentException("A second OWNER is not allowed for the organization");
            }

            // 2. Mandatory facility assignment for DATA_ENTRY role
            if (request.getRole() == UserRole.DATA_ENTRY
                    && (request.getFacilityIds() == null || request.getFacilityIds().isEmpty())) {
                throw new IllegalArgumentException("Facility assignment is mandatory for DATA_ENTRY role");
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }

            // 3. Create user with status PENDING
            User user = User.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .status(UserStatus.PENDING)
                    .build();
            user = userRepository.save(user);

            // 4. Assign role to organization
            Role role = roleRepository.findByName(request.getRole().name())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

            OrganizationUser orgUser = OrganizationUser.builder()
                    .organization(organization)
                    .user(user)
                    .role(role)
                    .build();
            organizationUserRepository.save(orgUser);

            // 5. Assign facilities if provided
            if (request.getFacilityIds() != null) {
                for (UUID facilityId : request.getFacilityIds()) {
                    Facility facility = facilityRepository.findById(facilityId)
                            .orElseThrow(() -> new RuntimeException("Facility not found: " + facilityId));
                    facilityUserMappingRepository.save(FacilityUserMapping.builder()
                            .facility(facility)
                            .user(user)
                            .build());
                }
            }

            // 6. Generate invitation token and send email
            String token = authService.generateInvitationToken(user);
            System.out.println("Invitation generated for user: " + user.getEmail() + " Token: " + token);

            // 6b. Send invitation email (includes assigned role)
            emailService.sendInvitationEmail(
                    user.getEmail(),
                    user.getFullName(),
                    getCurrentUser().getFullName(),
                    organization.getName(),
                    token,
                    request.getRole().name());

            // 7. Log audit
            auditService.log(organization, getCurrentUser(), "INVITED_USER: " + user.getEmail(), "USER_MANAGEMENT");

            String assignedFacilityNames = "—";
            if (request.getFacilityIds() != null && !request.getFacilityIds().isEmpty()) {
                assignedFacilityNames = facilityRepository.findAllById(request.getFacilityIds()).stream()
                        .map(Facility::getName)
                        .collect(Collectors.joining(", "));
            }

            return UserResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .status(user.getStatus())
                    .roles(List.of(request.getRole().name()))
                    .organizationId(organization.getId())
                    .facility(assignedFacilityNames)
                    .build();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error inviting user: " + e.getMessage());
            throw new RuntimeException("Failed to invite user: " + e.getMessage());
        }
    }

    /**
     * Hard-delete a PENDING user and all associated records from the DB.
     */
    @Transactional
    public void deletePendingUser(UUID userId) {
        Organization organization = getOrganizationForCurrentUser();
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        if (!userToDelete.getStatus().equals(UserStatus.PENDING)) {
            throw new RuntimeException("Only PENDING (uninvited) users can be deleted this way.");
        }
        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER cannot be deleted.");
        }

        // Capture info before deletion for the email
        String deletedEmail = userToDelete.getEmail();
        String deletedName = userToDelete.getFullName();
        String orgName = organization.getName();

        // 1. Remove invitation tokens
        invitationTokenRepository.deleteByUser(userToDelete);
        // 2. Remove facility mappings
        facilityUserMappingRepository.deleteByUser(userToDelete);
        // 3. Remove org membership
        organizationUserRepository.delete(orgUser);
        // 4. Hard-delete the user
        userRepository.delete(userToDelete);

        auditService.log(organization, getCurrentUser(), "DELETED_PENDING_USER: " + deletedEmail,
                "USER_MANAGEMENT");

        // 5. Notify via email (their invitation is cancelled)
        emailService.sendAccountDeletedEmail(deletedEmail, deletedName, orgName);
    }

    /**
     * Hard-delete ANY non-OWNER user and all associated records from the DB.
     * Works for ACTIVE, INACTIVE, and PENDING statuses.
     */
    @Transactional
    public void deleteUser(UUID userId) {
        Organization organization = getOrganizationForCurrentUser();
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER cannot be deleted.");
        }

        // Capture info before deletion
        String deletedEmail = userToDelete.getEmail();
        String deletedName = userToDelete.getFullName();
        String orgName = organization.getName();

        // 1. Remove invitation tokens
        invitationTokenRepository.deleteByUser(userToDelete);
        // 2. Remove facility mappings
        facilityUserMappingRepository.deleteByUser(userToDelete);
        // 3. Remove org membership
        organizationUserRepository.delete(orgUser);
        // 4. Hard-delete the user
        userRepository.delete(userToDelete);

        auditService.log(organization, getCurrentUser(), "DELETED_USER: " + deletedEmail,
                "USER_MANAGEMENT");

        // 5. Notify the deleted user via email
        emailService.sendAccountDeletedEmail(deletedEmail, deletedName, orgName);
    }

    /**
     * Update name, email, role and facilities for a PENDING user.
     */
    @Transactional
    public UserResponse updatePendingUser(UUID userId, EditPendingUserRequest request) {
        Organization organization = getOrganizationForCurrentUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        if (!user.getStatus().equals(UserStatus.PENDING)) {
            throw new RuntimeException("Only PENDING users can be edited this way.");
        }
        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER cannot be edited.");
        }

        // Update basic info
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        // Update role
        Role newRole = roleRepository.findByName(request.getRole().name())
                .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));
        orgUser.setRole(newRole);
        organizationUserRepository.save(orgUser);

        // Replace facility assignments
        facilityUserMappingRepository.deleteByUser(user);
        String assignedFacilityNames = "—";
        if (request.getFacilityIds() != null && !request.getFacilityIds().isEmpty()) {
            for (UUID facilityId : request.getFacilityIds()) {
                Facility facility = facilityRepository.findById(facilityId)
                        .orElseThrow(() -> new RuntimeException("Facility not found: " + facilityId));
                facilityUserMappingRepository.save(FacilityUserMapping.builder()
                        .facility(facility)
                        .user(user)
                        .build());
            }
            assignedFacilityNames = facilityRepository.findAllById(request.getFacilityIds()).stream()
                    .map(Facility::getName)
                    .collect(Collectors.joining(", "));
        }

        auditService.log(organization, getCurrentUser(), "EDITED_PENDING_USER: " + user.getEmail(), "USER_MANAGEMENT");

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .roles(List.of(request.getRole().name()))
                .organizationId(organization.getId())
                .facility(assignedFacilityNames)
                .build();
    }

    @Transactional
    public void updateUserRole(UUID userId, UserRole newRoleName) {
        Organization organization = getOrganizationForCurrentUser();
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        // OWNER cannot be demoted
        if (orgUser.getRole().getName().equals("OWNER") && newRoleName != UserRole.OWNER) {
            throw new RuntimeException("OWNER cannot be demoted or deleted");
        }

        // Cannot promote someone else to OWNER
        if (newRoleName == UserRole.OWNER && !orgUser.getRole().getName().equals("OWNER")) {
            throw new IllegalArgumentException(
                    "Cannot assign OWNER role directly. Ownership transfer must be done via specific transfer process.");
        }

        String oldRoleName = orgUser.getRole().getName();

        Role newRole = roleRepository.findByName(newRoleName.name())
                .orElseThrow(() -> new RuntimeException("Role not found"));

        orgUser.setRole(newRole);
        organizationUserRepository.save(orgUser);

        auditService.log(organization, getCurrentUser(),
                "UPDATED_ROLE: " + userToUpdate.getEmail() + " from " + oldRoleName + " to " + newRoleName,
                "USER_MANAGEMENT");

        // Notify the user about their role change
        emailService.sendRoleChangedEmail(
                userToUpdate.getEmail(),
                userToUpdate.getFullName(),
                organization.getName(),
                oldRoleName,
                newRoleName.name());
    }

    @Transactional
    public void softDeactivateUser(UUID userId) {
        Organization organization = getOrganizationForCurrentUser();
        User userToDeactivate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        // 9. OWNER cannot be deactivated or deleted
        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER cannot be deactivated or deleted");
        }

        userToDeactivate.setStatus(UserStatus.INACTIVE);
        userRepository.save(userToDeactivate);

        auditService.log(organization, getCurrentUser(), "DEACTIVATED_USER: " + userToDeactivate.getEmail(),
                "USER_MANAGEMENT");
    }

    @Transactional
    public void updateUserStatus(UUID userId, UserStatus newStatus) {
        Organization organization = getOrganizationForCurrentUser();
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER status cannot be changed");
        }

        // PENDING users can only be set to INACTIVE (not directly to ACTIVE — they must
        // accept invite)
        if (userToUpdate.getStatus() == UserStatus.PENDING && newStatus == UserStatus.ACTIVE) {
            throw new RuntimeException("Cannot activate a PENDING user — they must accept the invitation first");
        }

        userToUpdate.setStatus(newStatus);
        userRepository.save(userToUpdate);

        auditService.log(organization, getCurrentUser(),
                "UPDATED_STATUS: " + userToUpdate.getEmail() + " to " + newStatus, "USER_MANAGEMENT");
    }

    // Facility Management

    @Transactional
    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        try {
            Organization organization = getOrganizationForCurrentUser();

            Facility facility = Facility.builder()
                    .organization(organization)
                    .name(facilityDTO.getName())
                    .country(facilityDTO.getCountry())
                    .state(facilityDTO.getState())
                    .city(facilityDTO.getCity())
                    .productionCapacity(facilityDTO.getProductionCapacity())
                    .productType(facilityDTO.getProductType())
                    .status(FacilityStatus.ACTIVE)
                    .build();

            facility = facilityRepository.save(facility);
            auditService.log(organization, getCurrentUser(), "CREATED_FACILITY: " + facility.getName(),
                    "FACILITY_MANAGEMENT");

            return FacilityDTO.builder()
                    .id(facility.getId())
                    .name(facility.getName())
                    .country(facility.getCountry())
                    .state(facility.getState())
                    .city(facility.getCity())
                    .productionCapacity(facility.getProductionCapacity())
                    .productType(facility.getProductType())
                    .status(facility.getStatus())
                    .build();
        } catch (Exception e) {
            System.err.println("Error creating facility: " + e.getMessage());
            throw new RuntimeException("Failed to create facility: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<FacilityDTO> getAllFacilities() {
        Organization organization = getOrganizationForCurrentUser();
        List<Facility> facilities = facilityRepository.findByOrganizationId(organization.getId());

        return facilities.stream()
                .map(f -> FacilityDTO.builder()
                        .id(f.getId())
                        .name(f.getName())
                        .country(f.getCountry())
                        .state(f.getState())
                        .city(f.getCity())
                        .productionCapacity(f.getProductionCapacity())
                        .productType(f.getProductType())
                        .status(f.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        Organization organization = getOrganizationForCurrentUser();
        List<OrganizationUser> orgUsers = organizationUserRepository.findByOrganizationId(organization.getId());

        return orgUsers.stream()
                .map(ou -> {
                    List<FacilityUserMapping> mappings = facilityUserMappingRepository
                            .findByUserId(ou.getUser().getId());
                    String facilityNames = mappings.stream()
                            .map(m -> m.getFacility().getName())
                            .collect(Collectors.joining(", "));

                    return UserResponse.builder()
                            .id(ou.getUser().getId())
                            .fullName(ou.getUser().getFullName())
                            .email(ou.getUser().getEmail())
                            .status(ou.getUser().getStatus())
                            .roles(List.of(ou.getRole().getName()))
                            .organizationId(organization.getId())
                            .facility(facilityNames.isEmpty() ? "—" : facilityNames)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void archiveFacility(UUID facilityId) {
        Organization organization = getOrganizationForCurrentUser();
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        if (!facility.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Unauthorized facility access");
        }

        facility.setStatus(FacilityStatus.ARCHIVED);
        facilityRepository.save(facility);

        auditService.log(organization, getCurrentUser(), "ARCHIVED_FACILITY: " + facility.getName(),
                "FACILITY_MANAGEMENT");
    }

    /** Update an existing facility's details. */
    @Transactional
    public FacilityDTO updateFacility(UUID facilityId, FacilityDTO dto) {
        Organization organization = getOrganizationForCurrentUser();
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        if (!facility.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Unauthorized facility access");
        }

        facility.setName(dto.getName());
        if (dto.getCountry() != null)
            facility.setCountry(dto.getCountry());
        if (dto.getState() != null)
            facility.setState(dto.getState());
        if (dto.getCity() != null)
            facility.setCity(dto.getCity());
        if (dto.getProductType() != null)
            facility.setProductType(dto.getProductType());
        if (dto.getProductionCapacity() != null)
            facility.setProductionCapacity(dto.getProductionCapacity());

        Facility saved = facilityRepository.save(facility);

        auditService.log(organization, getCurrentUser(), "UPDATED_FACILITY: " + saved.getName(),
                "FACILITY_MANAGEMENT");

        return FacilityDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .country(saved.getCountry())
                .state(saved.getState())
                .city(saved.getCity())
                .productType(saved.getProductType())
                .productionCapacity(saved.getProductionCapacity())
                .status(saved.getStatus())
                .build();
    }

    /** Toggle facility status between ACTIVE and INACTIVE. */
    @Transactional
    public FacilityDTO toggleFacilityStatus(UUID facilityId) {
        Organization organization = getOrganizationForCurrentUser();
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        if (!facility.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Unauthorized facility access");
        }

        FacilityStatus newStatus = facility.getStatus() == FacilityStatus.ACTIVE
                ? FacilityStatus.INACTIVE
                : FacilityStatus.ACTIVE;
        facility.setStatus(newStatus);
        Facility saved = facilityRepository.save(facility);

        auditService.log(organization, getCurrentUser(),
                "TOGGLED_FACILITY_STATUS: " + saved.getName() + " → " + newStatus,
                "FACILITY_MANAGEMENT");

        return FacilityDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .country(saved.getCountry())
                .state(saved.getState())
                .city(saved.getCity())
                .productType(saved.getProductType())
                .productionCapacity(saved.getProductionCapacity())
                .status(saved.getStatus())
                .build();
    }

    /** Permanently delete a facility and all its user mappings. */
    @Transactional
    public void deleteFacilityPermanently(UUID facilityId) {
        Organization organization = getOrganizationForCurrentUser();
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        if (!facility.getOrganization().getId().equals(organization.getId())) {
            throw new RuntimeException("Unauthorized facility access");
        }

        String name = facility.getName();
        // Remove all user-facility assignments first
        facilityUserMappingRepository.deleteByFacility(facility);
        // Hard delete
        facilityRepository.delete(facility);

        auditService.log(organization, getCurrentUser(), "DELETED_FACILITY_PERMANENTLY: " + name,
                "FACILITY_MANAGEMENT");
    }

    /**
     * Edit an ACTIVE (or INACTIVE) user's name, email, and facility assignments.
     * Sends a notification email listing exactly what changed.
     */
    @Transactional
    public UserResponse updateActiveUser(UUID userId, EditActiveUserRequest request) {
        Organization organization = getOrganizationForCurrentUser();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OrganizationUser orgUser = organizationUserRepository
                .findByOrganizationIdAndUserId(organization.getId(), userId)
                .orElseThrow(() -> new RuntimeException("User not associated with organization"));

        if (orgUser.getRole().getName().equals("OWNER")) {
            throw new RuntimeException("OWNER profile cannot be edited this way.");
        }
        if (user.getStatus() == UserStatus.PENDING) {
            throw new RuntimeException("Use the pending-user edit endpoint for PENDING users.");
        }

        // ── Track what changed ─────────────────────────────────────────────
        List<String> changes = new java.util.ArrayList<>();

        // Name change
        if (!user.getFullName().equals(request.getFullName())) {
            changes.add("Name changed from \"" + user.getFullName() + "\" to \"" + request.getFullName() + "\"");
            user.setFullName(request.getFullName());
        }

        // Email change
        String oldEmail = user.getEmail();
        if (!oldEmail.equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            changes.add("Email changed from \"" + oldEmail + "\" to \"" + request.getEmail() + "\"");
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        // Facility changes
        List<FacilityUserMapping> existingMappings = facilityUserMappingRepository.findByUserId(userId);
        String oldFacilityNames = existingMappings.stream()
                .map(m -> m.getFacility().getName())
                .sorted()
                .collect(Collectors.joining(", "));

        facilityUserMappingRepository.deleteByUser(user);

        String newFacilityNames = "None";
        if (request.getFacilityIds() != null && !request.getFacilityIds().isEmpty()) {
            List<Facility> newFacilities = facilityRepository.findAllById(request.getFacilityIds());
            for (Facility f : newFacilities) {
                facilityUserMappingRepository.save(FacilityUserMapping.builder()
                        .facility(f)
                        .user(user)
                        .build());
            }
            newFacilityNames = newFacilities.stream()
                    .map(Facility::getName)
                    .sorted()
                    .collect(Collectors.joining(", "));
        }

        String oldFacilityDisplay = oldFacilityNames.isEmpty() ? "None" : oldFacilityNames;
        if (!oldFacilityDisplay.equals(newFacilityNames)) {
            changes.add("Facility assignments changed from [" + oldFacilityDisplay + "] to [" + newFacilityNames + "]");
        }

        // ── Audit + email ──────────────────────────────────────────────────
        String changesStr = String.join("; ", changes);
        auditService.log(organization, getCurrentUser(),
                "EDITED_ACTIVE_USER: " + user.getEmail() + (changes.isEmpty() ? " (no changes)" : " | " + changesStr),
                "USER_MANAGEMENT");

        if (!changes.isEmpty()) {
            emailService.sendProfileUpdatedEmail(
                    user.getEmail(),
                    user.getFullName(),
                    organization.getName(),
                    changes);
        }

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .roles(List.of(orgUser.getRole().getName()))
                .organizationId(organization.getId())
                .facility(newFacilityNames.equals("None") ? "—" : newFacilityNames)
                .build();
    }
}
