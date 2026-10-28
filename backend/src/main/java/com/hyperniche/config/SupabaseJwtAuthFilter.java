package com.hyperniche.config;

import com.hyperniche.common.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Component
public class SupabaseJwtAuthFilter extends OncePerRequestFilter {

    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;

    @Value("${supabase.jwt.issuer:}")
    private String jwtIssuer;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);
        UserPrincipal principal = null;

        if (StringUtils.hasText(token)) {
            try {
                principal = parseToken(token);
            } catch (Exception ex) {
                logger.warn("Could not authenticate JWT: " + ex.getMessage());
            }
        }

        if (principal != null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private UserPrincipal parseToken(String token) {
        if (!StringUtils.hasText(jwtSecret) || jwtSecret.contains("placeholder")) {
            throw new IllegalArgumentException("Supabase JWT secret is not configured");
        }

        Claims claims;
        byte[] keyBytes = resolveJwtKey(jwtSecret);
        try {
            var parser = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(keyBytes));
            if (StringUtils.hasText(jwtIssuer)) {
                parser.requireIssuer(jwtIssuer);
            }
            claims = parser.build().parseSignedClaims(token).getPayload();
        } catch (Exception ex) {
            throw new IllegalArgumentException("Supabase JWT verification failed", ex);
        }

        String sub = claims.getSubject();
        if (!StringUtils.hasText(sub)) {
            throw new IllegalArgumentException("Supabase JWT missing subject claim");
        }

        UUID userId = UUID.fromString(sub);
        String email = claims.get("email", String.class);
        if (!StringUtils.hasText(email)) {
            email = "user@hyperniche.com";
        }

        String role = "CREATOR";
        Map<String, Object> appMetadata = claims.get("app_metadata", Map.class);
        if (appMetadata != null && appMetadata.containsKey("role")) {
            role = String.valueOf(appMetadata.get("role"));
        } else if (claims.containsKey("role")) {
            role = claims.get("role", String.class);
        }

        return new UserPrincipal(userId, email, role);
    }

    private byte[] resolveJwtKey(String secret) {
        String trimmed = secret.trim();
        try {
            return Base64.getDecoder().decode(trimmed);
        } catch (IllegalArgumentException ignored) {
            return trimmed.getBytes(StandardCharsets.UTF_8);
        }
    }
}
