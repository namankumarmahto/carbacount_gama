package com.carbacount.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwtSecret:DefaultSecretKeyForCarbaCountAccountingSystemWhichMustBeLong}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs:86400000}") // 24 hours
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String role = userPrincipal.getAuthorities().stream()
                .map(org.springframework.security.core.GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_VIEWER");

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId().toString())
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSecretKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(getSecretKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSecretKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException e) {
            logger.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }

    // Compatibility methods for legacy code
    public String generateToken(Authentication authentication) {
        return generateJwtToken(authentication);
    }

    public String getUsernameFromJWT(String token) {
        return getUserNameFromJwtToken(token);
    }

    public boolean validateToken(String token) {
        return validateJwtToken(token);
    }
}
