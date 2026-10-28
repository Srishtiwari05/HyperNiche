package com.hyperniche.config;

import com.hyperniche.common.UserPrincipal;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class SupabaseJwtAuthFilterTest {

    private SupabaseJwtAuthFilter filter;

    @BeforeEach
    void setUp() {
        filter = new SupabaseJwtAuthFilter();
        ReflectionTestUtils.setField(filter, "jwtSecret", "test-secret-test-secret-test-secret-test-secret");
        ReflectionTestUtils.setField(filter, "jwtIssuer", "https://example.supabase.co");
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldIgnoreSpoofedIdentityHeadersWhenNoVerifiedToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid.jwt.token");
        request.addHeader("X-User-Id", UUID.randomUUID().toString());
        request.addHeader("X-User-Role", "BRAND");
        request.addHeader("X-User-Email", "victim@example.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldUseSubjectFromVerifiedTokenEvenWhenHeadersContainDifferentIdentity() throws Exception {
        UUID tokenUserId = UUID.randomUUID();
        UUID spoofedUserId = UUID.randomUUID();
        String token = Jwts.builder()
                .subject(tokenUserId.toString())
                .issuer("https://example.supabase.co")
                .claim("email", "real@example.com")
                .claim("app_metadata", Map.of("role", "CREATOR"))
                .signWith(Keys.hmacShaKeyFor("test-secret-test-secret-test-secret-test-secret".getBytes(StandardCharsets.UTF_8)))
                .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        request.addHeader("X-User-Id", spoofedUserId.toString());
        request.addHeader("X-User-Role", "BRAND");
        request.addHeader("X-User-Email", "attacker@example.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> {});

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        assertEquals(tokenUserId, principal.getId());
        assertEquals("real@example.com", principal.getEmail());
    }
}
