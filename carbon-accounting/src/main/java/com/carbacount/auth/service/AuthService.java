package com.carbacount.auth.service;

import com.carbacount.auth.dto.*;
import com.carbacount.auth.entity.InvitationToken;
import com.carbacount.auth.repository.InvitationTokenRepository;
import com.carbacount.common.enums.UserStatus;
import com.carbacount.organization.entity.Organization;
import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationRepository;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.security.JwtUtils;
import com.carbacount.security.UserPrincipal;
import com.carbacount.user.dto.UserResponse;
import com.carbacount.user.entity.Role;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.RoleRepository;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

        @Autowired
        private AuthenticationManager authenticationManager;

        @Autowired
        private JwtUtils jwtUtils;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private OrganizationUserRepository organizationUserRepository;

        @Autowired
        private InvitationTokenRepository invitationTokenRepository;

        @Autowired
        private RoleRepository roleRepository;

        @Autowired
        private OrganizationRepository organizationRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Transactional
        public UserResponse register(RegisterRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException("Email already exists");
                }

                User user = User.builder()
                                .fullName(request.getFullName())
                                .email(request.getEmail())
                                .passwordHash(passwordEncoder.encode(request.getPassword()))
                                .status(UserStatus.ACTIVE)
                                .build();
                user = userRepository.save(user);

                Organization organization = Organization.builder()
                                .name(request.getOrganizationName())
                                .createdBy(user)
                                .build();
                organization = organizationRepository.save(organization);

                Role ownerRole = roleRepository.findByName("OWNER")
                                .orElseThrow(() -> new RuntimeException("OWNER role not found"));

                OrganizationUser orgUser = OrganizationUser.builder()
                                .organization(organization)
                                .user(user)
                                .role(ownerRole)
                                .build();
                organizationUserRepository.save(orgUser);

                return UserResponse.builder()
                                .id(user.getId())
                                .fullName(user.getFullName())
                                .email(user.getEmail())
                                .status(user.getStatus())
                                .roles(List.of("OWNER"))
                                .organizationId(organization.getId())
                                .build();
        }

        public AuthResponse login(AuthRequest authRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(authRequest.getEmail(),
                                                authRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                User user = userRepository.findByEmail(userPrincipal.getEmail()).orElseThrow();

                List<OrganizationUser> orgUsers = organizationUserRepository.findByUser(user);
                UUID organizationId = orgUsers.isEmpty() ? null : orgUsers.get(0).getOrganization().getId();

                return AuthResponse.builder()
                                .token(jwt)
                                .user(UserResponse.builder()
                                                .id(user.getId())
                                                .fullName(user.getFullName())
                                                .email(user.getEmail())
                                                .status(user.getStatus())
                                                .organizationId(organizationId)
                                                .roles(userPrincipal.getAuthorities().stream()
                                                                .map(a -> a.getAuthority().replace("ROLE_", ""))
                                                                .collect(Collectors.toList()))
                                                .build())
                                .build();
        }

        @Transactional
        public void setPassword(SetPasswordRequest request) {
                InvitationToken invitationToken = invitationTokenRepository.findByToken(request.getToken())
                                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

                if (invitationToken.isUsed() || invitationToken.getExpiryTime().isBefore(LocalDateTime.now())) {
                        throw new RuntimeException("Token has expired or already been used");
                }

                User user = invitationToken.getUser();
                user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
                user.setStatus(UserStatus.ACTIVE);
                userRepository.save(user);

                invitationToken.setUsed(true);
                invitationTokenRepository.save(invitationToken);
        }

        @Transactional
        public String generateInvitationToken(User user) {
                InvitationToken invitationToken = InvitationToken.builder()
                                .user(user)
                                .token(UUID.randomUUID())
                                .expiryTime(LocalDateTime.now().plusHours(24))
                                .used(false)
                                .build();

                invitationTokenRepository.save(invitationToken);
                return invitationToken.getToken().toString();
        }
}
