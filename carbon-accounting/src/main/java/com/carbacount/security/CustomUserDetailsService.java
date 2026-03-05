package com.carbacount.security;

import com.carbacount.organization.entity.OrganizationUser;
import com.carbacount.organization.repository.OrganizationUserRepository;
import com.carbacount.user.entity.User;
import com.carbacount.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomUserDetailsService implements UserDetailsService {

    @Value("${app.platformAdminEmail:admin@carbacount.com}")
    private String platformAdminEmail;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        List<OrganizationUser> orgUsers = organizationUserRepository.findByUser(user);
        List<String> roles;

        if (orgUsers.isEmpty()) {
            // Platform ADMIN has no organization entry — assign ADMIN role directly
            roles = List.of("ADMIN");
        } else {
            roles = orgUsers.stream()
                    .map(ou -> ou.getRole().getName())
                    .distinct()
                    .collect(Collectors.toList());
        }

        UserPrincipal principal = UserPrincipal.create(user, roles);
        if (!orgUsers.isEmpty()) {
            principal.setOrganizationId(orgUsers.get(0).getOrganization().getId());
        }
        return principal;
    }
}
