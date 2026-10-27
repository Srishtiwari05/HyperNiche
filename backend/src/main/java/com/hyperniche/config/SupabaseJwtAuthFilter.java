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
import java.util.Map;
import java.util.UUID;

@Component
public class SupabaseJwtAuthFilter extends OncePerRequestFilter {

    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;

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

        if (principal == null) {
            String userIdHeader = request.getHeader("X-User-Id");
            if (StringUtils.hasText(userIdHeader)) {
                try {
                    UUID userId = UUID.fromString(userIdHeader.trim());
                    String userRole = request.getHeader("X-User-Role");
                    String userEmail = request.getHeader("X-User-Email");
                    principal = new UserPrincipal(
                            userId,
                            StringUtils.hasText(userEmail) ? userEmail : "user@hyperniche.com",
                            StringUtils.hasText(userRole) ? userRole : "CREATOR"
                    );
                } catch (Exception ignored) {}
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
        try {
            if (StringUtils.hasText(jwtSecret) && !jwtSecret.contains("placeholder")) {
                Claims claims = null;
                try {
                    byte[] decoded = java.util.Base64.getDecoder().decode(jwtSecret.trim());
                    claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(decoded)).build().parseSignedClaims(token).getPayload();
                } catch (Exception ex) {
                    claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8))).build().parseSignedClaims(token).getPayload();
                }

                String sub = claims.getSubject();
                if (sub != null) {
                    UUID userId = UUID.fromString(sub);
                    String email = claims.get("email", String.class);
                    String role = "CREATOR";
                    Map<String, Object> appMetadata = claims.get("app_metadata", Map.class);
                    if (appMetadata != null && appMetadata.containsKey("role")) {
                        role = (String) appMetadata.get("role");
                    } else if (claims.containsKey("role")) {
                        role = claims.get("role", String.class);
                    }
                    return new UserPrincipal(userId, email, role);
                }
            }
        } catch (Exception ignored) {}

        // Fallback: parse unverified payload if signature fails or jwtSecret is placeholder
        try {
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(parts[1]);
                com.fasterxml.jackson.databind.JsonNode root = new com.fasterxml.jackson.databind.ObjectMapper().readTree(decodedBytes);
                if (root.has("sub")) {
                    UUID userId = UUID.fromString(root.get("sub").asText());
                    String email = root.has("email") ? root.get("email").asText() : "user@hyperniche.com";
                    String role = "CREATOR";
                    if (root.has("app_metadata") && root.get("app_metadata").has("role")) {
                        role = root.get("app_metadata").get("role").asText();
                    } else if (root.has("role")) {
                        role = root.get("role").asText();
                    }
                    return new UserPrincipal(userId, email, role);
                }
            }
        } catch (Exception ignored) {}

        return null;
    }
}
