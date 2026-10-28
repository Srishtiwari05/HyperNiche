package com.hyperniche.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.AlgorithmParameters;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPublicKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SupabaseJwtAuthFilter extends OncePerRequestFilter {

    @Value("${supabase.jwt.secret:}")
    private String jwtSecret;

    @Value("${supabase.jwt.issuer:}")
    private String jwtIssuer;

    @Value("${supabase.url:${SUPABASE_URL:}}")
    private String supabaseUrl;

    private final Map<String, PublicKey> keyCache = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

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
            return bearer.substring(7).trim();
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private UserPrincipal parseToken(String token) {
        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid JWT format");
        }

        String alg = null;
        String kid = null;
        try {
            JsonNode headerNode = objectMapper.readTree(Base64.getUrlDecoder().decode(parts[0]));
            alg = headerNode.path("alg").asText(null);
            kid = headerNode.path("kid").asText(null);
        } catch (Exception ignored) {
        }

        Claims claims;
        try {
            if (alg != null && alg.startsWith("ES")) {
                PublicKey ecKey = getOrFetchPublicKey(kid);
                if (ecKey == null) {
                    throw new IllegalArgumentException("No EC public key found for kid: " + kid);
                }
                claims = Jwts.parser().verifyWith(ecKey).build().parseSignedClaims(token).getPayload();
            } else {
                if (!StringUtils.hasText(jwtSecret) || jwtSecret.contains("placeholder")) {
                    throw new IllegalArgumentException("Supabase JWT secret is not configured");
                }
                byte[] keyBytes = resolveJwtKey(jwtSecret);
                claims = Jwts.parser().verifyWith(Keys.hmacShaKeyFor(keyBytes)).build().parseSignedClaims(token).getPayload();
            }
        } catch (Exception ex) {
            throw new IllegalArgumentException("Supabase JWT verification failed", ex);
        }

        String issuer = claims.getIssuer();
        if (StringUtils.hasText(jwtIssuer) && !jwtIssuer.contains("xyzcompany") && !jwtIssuer.contains("placeholder")) {
            String cleanExpected = jwtIssuer.replaceAll("/auth/v1/?$", "").replaceAll("/+$", "");
            String cleanActual = issuer != null ? issuer.replaceAll("/auth/v1/?$", "").replaceAll("/+$", "") : "";
            if (!cleanExpected.equalsIgnoreCase(cleanActual) && !"supabase".equalsIgnoreCase(issuer)) {
                throw new IllegalArgumentException("Supabase JWT issuer mismatch");
            }
        }

        String sub = claims.getSubject();
        if (!StringUtils.hasText(sub)) {
            throw new IllegalArgumentException("Supabase JWT missing subject claim");
        }

        UUID userId = UUID.fromString(sub);

        Map<String, Object> userMetadata = claims.get("user_metadata", Map.class);
        Map<String, Object> appMetadata = claims.get("app_metadata", Map.class);

        String email = claims.get("email", String.class);
        if (!StringUtils.hasText(email) && userMetadata != null && userMetadata.containsKey("email")) {
            email = String.valueOf(userMetadata.get("email"));
        }
        if (!StringUtils.hasText(email)) {
            email = "user@hyperniche.com";
        }

        String role = "CREATOR";
        if (userMetadata != null && userMetadata.containsKey("role")) {
            role = String.valueOf(userMetadata.get("role"));
        } else if (appMetadata != null && appMetadata.containsKey("role")) {
            role = String.valueOf(appMetadata.get("role"));
        } else if (claims.containsKey("role")) {
            String cRole = claims.get("role", String.class);
            if (!"authenticated".equalsIgnoreCase(cRole) && !"anon".equalsIgnoreCase(cRole)) {
                role = cRole;
            }
        }

        if ("BUSINESS".equalsIgnoreCase(role)) {
            role = "BRAND";
        }

        return new UserPrincipal(userId, email, role.toUpperCase());
    }

    private PublicKey getOrFetchPublicKey(String kid) {
        if (kid == null) return null;
        if (keyCache.containsKey(kid)) {
            return keyCache.get(kid);
        }
        refreshJwks();
        return keyCache.get(kid);
    }

    private synchronized void refreshJwks() {
        String baseUrl = StringUtils.hasText(supabaseUrl) ? supabaseUrl : jwtIssuer;
        if (!StringUtils.hasText(baseUrl) || baseUrl.contains("xyzcompany") || baseUrl.contains("placeholder")) {
            return;
        }
        try {
            String clean = baseUrl.replaceAll("/auth/v1/?$", "").replaceAll("/+$", "");
            URI jwksUri = URI.create(clean + "/auth/v1/.well-known/jwks.json");
            HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
            HttpRequest request = HttpRequest.newBuilder(jwksUri).GET().timeout(Duration.ofSeconds(5)).build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode keys = root.get("keys");
                if (keys != null && keys.isArray()) {
                    for (JsonNode k : keys) {
                        String keyId = k.path("kid").asText(null);
                        String kty = k.path("kty").asText("");
                        if ("EC".equalsIgnoreCase(kty) && keyId != null) {
                            String x = k.path("x").asText();
                            String y = k.path("y").asText();
                            PublicKey pk = parseEcPublicKey(x, y);
                            keyCache.put(keyId, pk);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            logger.warn("Could not refresh Supabase JWKS: " + ex.getMessage());
        }
    }

    private PublicKey parseEcPublicKey(String xBase64Url, String yBase64Url) throws Exception {
        byte[] xBytes = Base64.getUrlDecoder().decode(xBase64Url);
        byte[] yBytes = Base64.getUrlDecoder().decode(yBase64Url);
        BigInteger x = new BigInteger(1, xBytes);
        BigInteger y = new BigInteger(1, yBytes);
        AlgorithmParameters params = AlgorithmParameters.getInstance("EC");
        params.init(new ECGenParameterSpec("secp256r1"));
        ECParameterSpec ecParams = params.getParameterSpec(ECParameterSpec.class);
        ECPublicKeySpec keySpec = new ECPublicKeySpec(new ECPoint(x, y), ecParams);
        return KeyFactory.getInstance("EC").generatePublic(keySpec);
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
