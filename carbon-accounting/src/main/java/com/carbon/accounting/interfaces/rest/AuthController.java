package com.carbon.accounting.interfaces.rest;

import com.carbon.accounting.core.domain.model.Role;
import com.carbon.accounting.infrastructure.persistence.entity.UserEntity;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataUserRepository;
import com.carbon.accounting.infrastructure.security.JwtTokenProvider;
import com.carbon.accounting.common.response.ApiResponse;
import com.carbon.accounting.infrastructure.persistence.entity.IndustryEntity;
import com.carbon.accounting.infrastructure.persistence.entity.PlantEntity;
import com.carbon.accounting.infrastructure.persistence.entity.TenantEntity;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataIndustryRepository;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataPlantRepository;
import com.carbon.accounting.infrastructure.persistence.repository.SpringDataTenantRepository;
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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final SpringDataUserRepository userRepository;
    private final SpringDataIndustryRepository industryRepository;
    private final SpringDataTenantRepository tenantRepository;
    private final SpringDataPlantRepository plantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> authenticateUser(
            @Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserEntity user = userRepository.findByEmail(loginRequest.getEmail()).get();

        JwtAuthenticationResponse responseData = new JwtAuthenticationResponse(jwt, user.getRole().name(),
                user.getIndustryId(), user.getIndustryTypeId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", responseData));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Email address already in use!", null));
        }

        TenantEntity tenant = TenantEntity.builder()
                .id(UUID.randomUUID())
                .name(signUpRequest.getIndustryName())
                .industryType("General")
                .createdAt(Instant.now())
                .active(true)
                .build();
        tenant = tenantRepository.save(tenant);

        IndustryEntity industry = IndustryEntity.builder()
                .name(signUpRequest.getIndustryName())
                .tenantId(tenant.getId())
                .industryTypeId(signUpRequest.getIndustryTypeId())
                .build();
        industry = industryRepository.save(industry);

        PlantEntity defaultPlant = PlantEntity.builder()
                .name("Main Plant")
                .location("HQ")
                .industry(industry)
                .tenantId(tenant.getId())
                .build();
        plantRepository.save(defaultPlant);

        UserEntity user = UserEntity.builder()
                .id(UUID.randomUUID())
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .role(Role.INDUSTRY)
                .industryId(industry.getId())
                .industryTypeId(signUpRequest.getIndustryTypeId())
                .tenantId(tenant.getId())
                .build();
        userRepository.save(user);

        return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully", null));
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
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JwtAuthenticationResponse {
        private String token;
        private String role;
        private UUID industryId;
        private UUID industryTypeId;
    }
}
