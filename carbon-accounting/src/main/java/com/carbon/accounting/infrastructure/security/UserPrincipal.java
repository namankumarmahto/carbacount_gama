package com.carbon.accounting.infrastructure.security;

import com.carbon.accounting.infrastructure.persistence.entity.UserEntity;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    private final UUID id;
    private final String email;
    private final String password;
    @Getter
    private final UUID industryId;
    @Getter
    private final UUID tenantId;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String email, String password, UUID industryId, UUID tenantId,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.industryId = industryId;
        this.tenantId = tenantId;
        this.authorities = authorities;
    }

    public static UserPrincipal create(UserEntity user) {
        List<GrantedAuthority> authorities = Collections
                .singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.getIndustryId(),
                user.getTenantId(),
                authorities);
    }

    public UUID getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
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
