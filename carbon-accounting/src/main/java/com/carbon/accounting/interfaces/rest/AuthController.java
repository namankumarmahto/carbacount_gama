package com.carbon.accounting.interfaces.rest;

import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.user.entity.Role;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.RoleRepository;
import com.carbacount.user.repository.UserRepository;
import com.carbacount.security.JwtUtils;
import com.carbacount.common.enums.UserStatus;
import com.carbacount.common.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataIndustryTypeRepository industryTypeRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataCountryRepository countryRepository;
    private final com.carbon.accounting.infrastructure.persistence.repository.SpringDataStateRepository stateRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(authentication);

            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<OrganizationUser> orgMappings = organizationUserRepository.findByUser(user);
            String roleName = "VIEWER";
            String orgName = "Unknown Organization";

            String orgId = null;
            if (!orgMappings.isEmpty()) {
                OrganizationUser primaryMapping = orgMappings.get(0);
                roleName = primaryMapping.getRole().getName();
                orgName = primaryMapping.getOrganization().getName();
                orgId = primaryMapping.getOrganization().getId() != null
                        ? primaryMapping.getOrganization().getId().toString()
                        : null;
            }

            JwtAuthenticationResponse responseData = new JwtAuthenticationResponse(jwt,
                    roleName, user.getFullName(), orgName, orgId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", responseData));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Auth failure: " + e.getMessage(), null));
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        try {
            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Email address already in use!", null));
            }

            // 1. Create User
            User user = User.builder()
                    .fullName(signUpRequest.getName())
                    .email(signUpRequest.getEmail())
                    .passwordHash(passwordEncoder.encode(signUpRequest.getPassword()))
                    .status(UserStatus.ACTIVE)
                    .build();
            user = userRepository.saveAndFlush(user);

            // Lookup names from UUIDs
            String industryTypeName = industryTypeRepository.findById(signUpRequest.getIndustryTypeId())
                    .orElseThrow(() -> new RuntimeException("Invalid Industry Type"))
                    .getName();

            String countryName = countryRepository.findById(signUpRequest.getCountryId())
                    .orElseThrow(() -> new RuntimeException("Invalid Country"))
                    .getName();

            String stateName = null;
            if (signUpRequest.getStateId() != null) {
                stateName = stateRepository.findById(signUpRequest.getStateId())
                        .orElseThrow(() -> new RuntimeException("Invalid State"))
                        .getName();
            }

            // 2. Create Organization
            Organization organization = Organization.builder()
                    .name(signUpRequest.getIndustryName())
                    .industryType(industryTypeName)
                    .country(countryName)
                    .state(stateName)
                    .city(signUpRequest.getCity())
                    .gstNumber(signUpRequest.getGstNumber())
                    .createdBy(user)
                    .build();
            organization = organizationRepository.save(organization);

            // 3. Map User as OWNER
            Role ownerRole = roleRepository.findByName("OWNER")
                    .orElseThrow(() -> new RuntimeException("OWNER role not found"));

            // Check if owner already exists for org (strictly enforced by index too)
            if (organizationUserRepository.existsByOrganizationIdAndRoleName(organization.getId(), "OWNER")) {
                throw new RuntimeException("An OWNER already exists for this organization");
            }

            OrganizationUser orgUser = OrganizationUser.builder()
                    .organization(organization)
                    .user(user)
                    .role(ownerRole)
                    .build();
            organizationUserRepository.save(orgUser);

            return ResponseEntity.ok(new ApiResponse<>(true, "Registration successful", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Registration failed: " + e.getMessage(), null));
        }
    }

    @Data
    public static class LoginRequest {
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class SignUpRequest {
        @NotBlank
        private String name;
        @NotBlank
        @Email
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String industryName;
        @jakarta.validation.constraints.NotNull
        private UUID industryTypeId;
        @jakarta.validation.constraints.NotNull
        private UUID countryId;
        private UUID stateId;
        private String city;
        private String gstNumber;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JwtAuthenticationResponse {
        private String token;
        private String role;
        private String userName;
        private String industryName;
        private String industryId; // Organization ID
    }
}
