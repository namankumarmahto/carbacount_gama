package com.carbacount.security;

import com.carbacount.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {

                Claims claims = jwtUtils.getClaimsFromToken(jwt);
                Boolean orgScoped = claims.get("orgScoped", Boolean.class);

                if (Boolean.TRUE.equals(orgScoped)) {
                    // ── ORG-SCOPED TOKEN (ADMIN entered an organisation) ──────────────────
                    // We need to build a UserPrincipal with ROLE_OWNER and the ownerUserId
                    // so that OwnerService.getCurrentUser() resolves to the actual OWNER user
                    // (which makes all org-scoped DB queries work correctly).
                    String email = claims.getSubject();
                    String ownerUserIdStr = claims.get("ownerUserId", String.class);
                    UUID ownerUserId = UUID.fromString(ownerUserIdStr);

                    // Verify the OWNER user still exists (prevents orphan org-scoped sessions after
                    // DB reset)
                    if (!userRepository.existsById(ownerUserId)) {
                        logger.warn("Org-scoped token for {} references non-existent user ID: {}", email, ownerUserId);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    String organizationId = claims.get("organizationId", String.class);

                    UserDetails baseDetails = userDetailsService.loadUserByUsername(email);
                    UserPrincipal adminPrincipal = (UserPrincipal) baseDetails;

                    // Create a new principal that looks like the OWNER user in that org
                    UserPrincipal orgScopedPrincipal = UserPrincipal.builder()
                            .id(ownerUserId) // acts as OWNER user
                            .fullName(adminPrincipal.getFullName())
                            .email(email)
                            .password(adminPrincipal.getPassword())
                            .authorities(List.of(new SimpleGrantedAuthority("ROLE_OWNER")))
                            .orgScoped(true)
                            .organizationId(UUID.fromString(organizationId))
                            .build();

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            orgScopedPrincipal, null,
                            orgScopedPrincipal.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                } else {
                    // ── STANDARD TOKEN ────────────────────────────────────────────────────
                    String email = jwtUtils.getUserNameFromJwtToken(jwt);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null,
                            userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
