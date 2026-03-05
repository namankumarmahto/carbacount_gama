package com.carbacount.security;

import com.carbacount.user.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {
    private UUID id;
    private String fullName;
    private String email;

    @JsonIgnore
    private String password;

    // Legacy fields kept for compatibility
    private UUID industryId;
    private UUID industryTypeId;
    private UUID tenantId;
    private UUID countryId;
    private UUID stateId;

    // Org-scoped session fields (set when ADMIN has entered an org)
    @Builder.Default
    private boolean orgScoped = false;
    private UUID organizationId;

    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Standard factory — creates principal from user + their org roles.
     */
    public static UserPrincipal create(User user, List<String> roles) {
        List<GrantedAuthority> authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());

        return UserPrincipal.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(authorities)
                .orgScoped(false)
                .build();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
