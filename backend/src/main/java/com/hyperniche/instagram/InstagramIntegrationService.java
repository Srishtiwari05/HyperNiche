package com.hyperniche.instagram;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class InstagramIntegrationService {
    private static final Logger log = LoggerFactory.getLogger(InstagramIntegrationService.class);
    private static final String GRAPH_HOST = "https://graph.facebook.com";
    private final JdbcTemplate jdbc;
    private final RestClient http = RestClient.create();
    private final ObjectMapper json;
    private final InstagramTokenCipher cipher;
    private final SecureRandom random = new SecureRandom();
    private final String appId;
    private final String appSecret;
    private final String loginConfigId;
    private final String redirectUri;
    private final String frontendUrl;
    private final String apiVersion;
    private final String webhookVerifyToken;
    private final String workflowSecret;
    private final String n8nWebhookUrl;

    public InstagramIntegrationService(
            JdbcTemplate jdbc,
            ObjectMapper json,
            InstagramTokenCipher cipher,
            @Value("${instagram.app-id:}") String appId,
            @Value("${instagram.app-secret:}") String appSecret,
            @Value("${instagram.login-config-id:}") String loginConfigId,
            @Value("${instagram.redirect-uri:}") String redirectUri,
            @Value("${instagram.frontend-url:http://localhost:3000}") String frontendUrl,
            @Value("${instagram.api-version:v27.0}") String apiVersion,
            @Value("${instagram.webhook-verify-token:}") String webhookVerifyToken,
            @Value("${instagram.workflow-secret:}") String workflowSecret,
            @Value("${instagram.n8n-webhook-url:}") String n8nWebhookUrl
    ) {
        this.jdbc = jdbc;
        this.json = json;
        this.cipher = cipher;
        this.appId = appId;
        this.appSecret = appSecret;
        this.loginConfigId = loginConfigId;
        this.redirectUri = redirectUri;
        this.frontendUrl = frontendUrl.replaceAll("/+$", "");
        this.apiVersion = apiVersion;
        this.webhookVerifyToken = webhookVerifyToken;
        this.workflowSecret = workflowSecret;
        this.n8nWebhookUrl = n8nWebhookUrl;
    }

    public String beginLogin(UUID userId) {
        requireMetaConfiguration();
        String state = newState();
        jdbc.update("DELETE FROM instagram_oauth_states WHERE expires_at < NOW()");
        jdbc.update("INSERT INTO instagram_oauth_states (state_hash, user_id, expires_at) VALUES (?, ?, ?)",
                sha256(state), userId, OffsetDateTime.ofInstant(Instant.now().plus(10, ChronoUnit.MINUTES), ZoneOffset.UTC));

        return UriComponentsBuilder.fromUriString("https://www.facebook.com/" + apiVersion + "/dialog/oauth")
                .queryParam("client_id", appId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("config_id", loginConfigId)
                .queryParam("response_type", "code")
                .queryParam("override_default_response_type", "true")
                .queryParam("state", state)
                .build().encode().toUriString();
    }

    public void completeLogin(String code, String state) {
        requireMetaConfiguration();
        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            throw new IllegalArgumentException("Instagram authorization was not completed.");
        }
        List<UUID> owners = jdbc.query("SELECT user_id FROM instagram_oauth_states WHERE state_hash = ? AND expires_at > NOW()",
                (rs, row) -> rs.getObject("user_id", UUID.class), sha256(state));
        jdbc.update("DELETE FROM instagram_oauth_states WHERE state_hash = ?", sha256(state));
        if (owners.isEmpty()) throw new IllegalArgumentException("Instagram sign-in expired. Please connect again.");

        JsonNode tokenResponse = exchangeMetaCode(code);
        String token = requiredText(tokenResponse, "access_token");
        long expiresIn = tokenResponse.path("expires_in").asLong(3_153_600_000L);
        JsonNode accounts = graphGet("/me/assigned_instagram_accounts", Map.of(
                "fields", "id,username,name,account_type,profile_picture_url,biography,followers_count,follows_count,media_count",
                "access_token", token));
        JsonNode data = accounts.path("data");
        if (!data.isArray() || data.isEmpty()) {
            throw new IllegalStateException("Meta did not return an Instagram professional account. Check that the account is included in the login configuration.");
        }
        if (data.size() > 1) {
            throw new IllegalStateException("More than one Instagram account was authorized. Configure one Instagram account and reconnect.");
        }
        JsonNode profile = data.get(0);
        String instagramUserId = text(profile, "id", text(profile, "user_id", null));
        String username = text(profile, "username", null);
        if (instagramUserId == null || username == null) throw new IllegalStateException("Instagram did not return the connected profile.");

        jdbc.update("""
                INSERT INTO instagram_connections
                    (user_id, instagram_user_id, username, name, account_type, profile_picture_url, biography,
                     followers_count, follows_count, media_count, encrypted_access_token, token_expires_at,
                     token_updated_at, sync_status, last_sync_error, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'CONNECTED', NULL, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    instagram_user_id = EXCLUDED.instagram_user_id, username = EXCLUDED.username,
                    name = EXCLUDED.name, account_type = EXCLUDED.account_type,
                    profile_picture_url = EXCLUDED.profile_picture_url, biography = EXCLUDED.biography,
                    followers_count = EXCLUDED.followers_count, follows_count = EXCLUDED.follows_count,
                    media_count = EXCLUDED.media_count, encrypted_access_token = EXCLUDED.encrypted_access_token,
                    token_expires_at = EXCLUDED.token_expires_at, token_updated_at = NOW(),
                    sync_status = 'CONNECTED', last_sync_error = NULL, updated_at = NOW()
                """, owners.get(0), instagramUserId, username, text(profile, "name", null),
                text(profile, "account_type", null), text(profile, "profile_picture_url", null),
                text(profile, "biography", null), number(profile, "followers_count"), number(profile, "follows_count"),
                number(profile, "media_count"), cipher.encrypt(token), OffsetDateTime.ofInstant(Instant.now().plusSeconds(expiresIn), ZoneOffset.UTC));
        syncOne(owners.get(0));
    }

    public Map<String, Object> getMyAccount(UUID userId) {
        List<Map<String, Object>> rows = jdbc.queryForList("""
                SELECT username, name, account_type, profile_picture_url, biography, followers_count,
                       follows_count, media_count, discoverable, share_insights, last_synced_at,
                       sync_status, last_sync_error, token_expires_at
                FROM instagram_connections WHERE user_id = ?
                """, userId);
        if (rows.isEmpty()) return Map.of("connected", false);
        Map<String, Object> response = new LinkedHashMap<>(rows.get(0));
        response.put("connected", true);
        return response;
    }

    public Map<String, Object> getMyAnalytics(UUID userId) {
        Map<String, Object> response = new LinkedHashMap<>(getMyAccount(userId));
        if (!Boolean.TRUE.equals(response.get("connected"))) return response;
        response.put("history", jdbc.query("""
                SELECT captured_at, CAST(metrics_json AS TEXT) AS metrics_json
                FROM instagram_analytics_snapshots WHERE user_id = ? ORDER BY captured_at DESC LIMIT 90
                """, (rs, row) -> snapshot(rs.getTimestamp("captured_at").toInstant(), rs.getString("metrics_json")), userId));
        response.put("media", jdbc.query("""
                SELECT media_id, media_type, permalink, thumbnail_url, published_at,
                       CAST(metrics_json AS TEXT) AS metrics_json
                FROM instagram_media_snapshots WHERE user_id = ? ORDER BY published_at DESC NULLS LAST LIMIT 12
                """, (rs, row) -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mediaId", rs.getString("media_id"));
            item.put("mediaType", rs.getString("media_type"));
            item.put("permalink", rs.getString("permalink"));
            item.put("thumbnailUrl", rs.getString("thumbnail_url"));
            item.put("publishedAt", rs.getTimestamp("published_at") == null ? null : rs.getTimestamp("published_at").toInstant());
            item.put("metrics", parseJson(rs.getString("metrics_json")));
            return item;
        }, userId));
        response.put("history", ((List<Map<String, Object>>) response.get("history")).stream().sorted(
                java.util.Comparator.comparing(item -> (Instant) item.get("capturedAt"))).toList());
        response.put("latest", ((List<Map<String, Object>>) response.get("history")).stream().reduce((first, second) -> second).orElse(Map.of()));
        return response;
    }

    public List<Map<String, Object>> search(String query) {
        String term = query == null ? "" : query.trim().toLowerCase().replace("%", "").replace("_", "");
        if (term.length() < 2) return List.of();
        String pattern = "%" + term + "%";
        return jdbc.query("""
                SELECT u.id AS creator_id, u.display_name, u.avatar_url, u.bio,
                       i.username, i.name AS instagram_name, i.account_type,
                       i.profile_picture_url, i.biography, i.followers_count, i.follows_count,
                       i.media_count, i.share_insights, c.niche, c.engagement_rate,
                       c.rate_reel_inr, c.rate_post_inr, c.rate_story_inr, c.rate_video_inr,
                       CASE WHEN i.share_insights THEN (
                           SELECT CAST(s.metrics_json AS TEXT) FROM instagram_analytics_snapshots s
                           WHERE s.user_id = i.user_id ORDER BY s.captured_at DESC LIMIT 1
                       ) ELSE NULL END AS metrics_json
                FROM instagram_connections i
                JOIN users u ON u.id = i.user_id
                LEFT JOIN creator_profiles c ON c.user_id = i.user_id
                WHERE i.discoverable = TRUE
                  AND (LOWER(u.display_name) LIKE ? OR LOWER(i.username) LIKE ? OR LOWER(COALESCE(c.instagram_handle, '')) LIKE ?)
                ORDER BY i.followers_count DESC LIMIT 30
                """, (rs, row) -> {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("creatorId", rs.getObject("creator_id", UUID.class));
            result.put("displayName", rs.getString("display_name"));
            result.put("avatarUrl", rs.getString("avatar_url"));
            result.put("bio", rs.getString("bio"));
            result.put("instagramUsername", rs.getString("username"));
            result.put("instagramName", rs.getString("instagram_name"));
            result.put("accountType", rs.getString("account_type"));
            result.put("profilePictureUrl", rs.getString("profile_picture_url"));
            result.put("instagramBio", rs.getString("biography"));
            result.put("followersCount", rs.getInt("followers_count"));
            result.put("followsCount", rs.getInt("follows_count"));
            result.put("mediaCount", rs.getInt("media_count"));
            result.put("niche", rs.getString("niche"));
            result.put("engagementRate", rs.getBigDecimal("engagement_rate"));
            result.put("rateReelInr", rs.getBigDecimal("rate_reel_inr"));
            result.put("ratePostInr", rs.getBigDecimal("rate_post_inr"));
            result.put("rateStoryInr", rs.getBigDecimal("rate_story_inr"));
            result.put("rateVideoInr", rs.getBigDecimal("rate_video_inr"));
            result.put("insights", parseJson(rs.getString("metrics_json")));
            return result;
        }, pattern, pattern, pattern);
    }

    public Map<String, Object> getPublicProfile(UUID creatorId) {
        List<Map<String, Object>> results = searchByCreator(creatorId);
        if (results.isEmpty()) throw new IllegalArgumentException("This creator has not shared an Instagram profile.");
        return results.get(0);
    }

    private List<Map<String, Object>> searchByCreator(UUID creatorId) {
        return jdbc.query("""
                SELECT u.id AS creator_id, u.display_name, u.avatar_url, u.bio,
                       i.username, i.name AS instagram_name, i.account_type,
                       i.profile_picture_url, i.biography, i.followers_count, i.follows_count,
                       i.media_count, i.share_insights, c.niche, c.engagement_rate,
                       c.rate_reel_inr, c.rate_post_inr, c.rate_story_inr, c.rate_video_inr,
                       CASE WHEN i.share_insights THEN (
                           SELECT CAST(s.metrics_json AS TEXT) FROM instagram_analytics_snapshots s
                           WHERE s.user_id = i.user_id ORDER BY s.captured_at DESC LIMIT 1
                       ) ELSE NULL END AS metrics_json
                FROM instagram_connections i JOIN users u ON u.id = i.user_id
                LEFT JOIN creator_profiles c ON c.user_id = i.user_id
                WHERE i.user_id = ? AND i.discoverable = TRUE
                """, (rs, row) -> {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("creatorId", rs.getObject("creator_id", UUID.class));
            result.put("displayName", rs.getString("display_name"));
            result.put("avatarUrl", rs.getString("avatar_url"));
            result.put("bio", rs.getString("bio"));
            result.put("instagramUsername", rs.getString("username"));
            result.put("instagramName", rs.getString("instagram_name"));
            result.put("accountType", rs.getString("account_type"));
            result.put("profilePictureUrl", rs.getString("profile_picture_url"));
            result.put("instagramBio", rs.getString("biography"));
            result.put("followersCount", rs.getInt("followers_count"));
            result.put("followsCount", rs.getInt("follows_count"));
            result.put("mediaCount", rs.getInt("media_count"));
            result.put("niche", rs.getString("niche"));
            result.put("engagementRate", rs.getBigDecimal("engagement_rate"));
            result.put("rateReelInr", rs.getBigDecimal("rate_reel_inr"));
            result.put("ratePostInr", rs.getBigDecimal("rate_post_inr"));
            result.put("rateStoryInr", rs.getBigDecimal("rate_story_inr"));
            result.put("rateVideoInr", rs.getBigDecimal("rate_video_inr"));
            result.put("insights", parseJson(rs.getString("metrics_json")));
            return result;
        }, creatorId);
    }

    public void updateVisibility(UUID userId, boolean discoverable, boolean shareInsights) {
        int changed = jdbc.update("UPDATE instagram_connections SET discoverable = ?, share_insights = ?, updated_at = NOW() WHERE user_id = ?",
                discoverable, shareInsights, userId);
        if (changed == 0) throw new IllegalArgumentException("Connect an Instagram account first.");
    }

    public void disconnect(UUID userId) {
        jdbc.update("DELETE FROM instagram_connections WHERE user_id = ?", userId);
    }

    public String frontendUrl() {
        return frontendUrl;
    }

    public void syncAll() {
        jdbc.query("SELECT user_id FROM instagram_connections ORDER BY last_synced_at NULLS FIRST",
                (rs, row) -> rs.getObject("user_id", UUID.class)).forEach(this::syncOne);
    }

    public void syncOne(UUID userId) {
        syncOne(userId, true);
    }

    private void syncOne(UUID userId, boolean notifyOnFailure) {
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT * FROM instagram_connections WHERE user_id = ?", userId);
        if (rows.isEmpty()) throw new IllegalArgumentException("No connected Instagram account was found.");
        Map<String, Object> connection = rows.get(0);
        try {
            String token = cipher.decrypt((String) connection.get("encrypted_access_token"));
            Instant expiresAt = toInstant(connection.get("token_expires_at"));
            if (expiresAt.isBefore(Instant.now())) throw new IllegalStateException("Instagram token expired; reconnect this account.");

            String instagramUserId = (String) connection.get("instagram_user_id");
            JsonNode profile = graphGet("/" + instagramUserId, Map.of(
                    "fields", "user_id,username,name,account_type,profile_picture_url,biography,followers_count,follows_count,media_count",
                    "access_token", token));
            jdbc.update("""
                    UPDATE instagram_connections SET username = ?, name = ?, account_type = ?,
                        profile_picture_url = ?, biography = ?, followers_count = ?, follows_count = ?,
                        media_count = ?, updated_at = NOW() WHERE user_id = ?
                    """, text(profile, "username", (String) connection.get("username")),
                    text(profile, "name", null), text(profile, "account_type", null),
                    text(profile, "profile_picture_url", null), text(profile, "biography", null),
                    number(profile, "followers_count"), number(profile, "follows_count"), number(profile, "media_count"), userId);

            Map<String, Object> metrics = new LinkedHashMap<>();
            metrics.put("follower_count", number(profile, "followers_count"));
            String partialError = null;
            try {
                JsonNode accountInsights = graphGet("/" + instagramUserId + "/insights", Map.of(
                        "metric", "reach,views,accounts_engaged,total_interactions,follower_count",
                        "period", "day", "access_token", token));
                addLatestMetrics(metrics, accountInsights.path("data"));
            } catch (RuntimeException ex) {
                partialError = "Account insights are unavailable for the granted permissions or this account.";
                log.info("Instagram account insights unavailable for creator {}", userId);
            }
            try {
                JsonNode demographics = graphGet("/" + instagramUserId + "/insights", Map.of(
                        "metric", "follower_demographics,engaged_audience_demographics,reached_audience_demographics",
                        "period", "lifetime", "access_token", token));
                addLatestMetrics(metrics, demographics.path("data"));
            } catch (RuntimeException ex) {
                log.info("Instagram audience demographics unavailable for creator {}", userId);
            }
            Object followers = metrics.get("follower_count");
            Object interactions = metrics.get("total_interactions");
            if (followers instanceof Number followerCount && followerCount.longValue() > 0 && interactions instanceof Number count) {
                metrics.put("engagement_rate", Math.round(count.doubleValue() / followerCount.doubleValue() * 10000.0) / 100.0);
            }
            jdbc.update("INSERT INTO instagram_analytics_snapshots (user_id, metrics_json) VALUES (?, CAST(? AS JSONB))",
                    userId, toJson(metrics));

            try {
                syncMedia(userId, instagramUserId, token);
            } catch (RuntimeException ex) {
                partialError = "Recent post insights are unavailable for this account.";
                log.info("Instagram post metrics unavailable for creator {}", userId);
            }
            jdbc.update("UPDATE instagram_connections SET last_synced_at = NOW(), sync_status = ?, last_sync_error = ?, updated_at = NOW() WHERE user_id = ?",
                    partialError == null ? "SYNCED" : "PARTIAL", partialError, userId);
        } catch (RuntimeException ex) {
            String safeError = safeError(ex);
            boolean reconnect = safeError.toLowerCase().contains("token expired");
            jdbc.update("UPDATE instagram_connections SET sync_status = ?, last_sync_error = ?, updated_at = NOW() WHERE user_id = ?",
                    reconnect ? "RECONNECT_REQUIRED" : "SYNC_FAILED", safeError, userId);
            if (notifyOnFailure) notifyWorkflow(userId, safeError);
            log.warn("Instagram sync failed for creator {}: {}", userId, safeError);
        } catch (Exception ex) {
            jdbc.update("UPDATE instagram_connections SET sync_status = 'SYNC_FAILED', last_sync_error = 'Instagram sync failed. Please retry.', updated_at = NOW() WHERE user_id = ?", userId);
            if (notifyOnFailure) notifyWorkflow(userId, "Instagram sync failed. Please retry.");
            log.warn("Instagram sync failed for creator {}", userId, ex);
        }
    }

    private void syncMedia(UUID userId, String instagramUserId, String token) {
        JsonNode mediaPage = graphGet("/" + instagramUserId + "/media", Map.of(
                "fields", "id,media_type,media_product_type,permalink,thumbnail_url,timestamp,like_count,comments_count",
                "limit", "6", "access_token", token));
        for (JsonNode media : mediaPage.path("data")) {
            String mediaId = text(media, "id", null);
            if (mediaId == null) continue;
            Map<String, Object> metrics = new LinkedHashMap<>();
            metrics.put("likes", number(media, "like_count"));
            metrics.put("comments", number(media, "comments_count"));
            try {
                JsonNode insights = graphGet("/" + mediaId + "/insights", Map.of(
                        "metric", "reach,views,likes,comments,saved,shares,total_interactions",
                        "access_token", token));
                addLatestMetrics(metrics, insights.path("data"));
            } catch (RuntimeException ex) {
                // Basic media counts remain useful when Meta does not expose per-post insights.
            }
            jdbc.update("""
                    INSERT INTO instagram_media_snapshots
                        (media_id, user_id, media_type, permalink, thumbnail_url, published_at, metrics_json, synced_at)
                    VALUES (?, ?, ?, ?, ?, ?, CAST(? AS JSONB), NOW())
                    ON CONFLICT (media_id) DO UPDATE SET media_type = EXCLUDED.media_type,
                        permalink = EXCLUDED.permalink, thumbnail_url = EXCLUDED.thumbnail_url,
                        published_at = EXCLUDED.published_at, metrics_json = EXCLUDED.metrics_json,
                        synced_at = NOW()
                    """, mediaId, userId, text(media, "media_product_type", text(media, "media_type", "POST")),
                    text(media, "permalink", null), text(media, "thumbnail_url", null),
                    instantOrNull(text(media, "timestamp", null)), toJson(metrics));
        }
    }

    public boolean isValidWebhookSignature(String signature, byte[] body) {
        if (signature == null || !signature.startsWith("sha256=") || appSecret.isBlank()) return false;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(appSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = HexFormat.of().parseHex(signature.substring(7));
            return MessageDigest.isEqual(expected, mac.doFinal(body));
        } catch (Exception ex) {
            return false;
        }
    }

    public String verifyWebhook(String mode, String token, String challenge) {
        if ("subscribe".equals(mode) && !webhookVerifyToken.isBlank() && webhookVerifyToken.equals(token)) return challenge;
        throw new IllegalArgumentException("Instagram webhook verification failed.");
    }

    @Async
    public void queueWebhookSync(byte[] body) {
        try {
            JsonNode payload = json.readTree(body);
            for (JsonNode entry : payload.path("entry")) {
                String instagramUserId = text(entry, "id", null);
                if (instagramUserId == null) continue;
                List<UUID> ids = jdbc.query("SELECT user_id FROM instagram_connections WHERE instagram_user_id = ?",
                        (rs, row) -> rs.getObject("user_id", UUID.class), instagramUserId);
                ids.forEach(this::syncOne);
            }
        } catch (Exception ex) {
            log.warn("Instagram webhook payload could not be processed", ex);
        }
    }

    public boolean triggerWorkflowSync(String secret, UUID userId) {
        if (workflowSecret.isBlank() || !MessageDigest.isEqual(workflowSecret.getBytes(StandardCharsets.UTF_8),
                (secret == null ? "" : secret).getBytes(StandardCharsets.UTF_8))) {
            throw new org.springframework.security.access.AccessDeniedException("Invalid Instagram workflow secret");
        }
        if (userId == null) {
            syncAll();
            return true;
        }
        syncOne(userId, false);
        return !"SYNC_FAILED".equals(getMyAccount(userId).get("sync_status"))
                && !"RECONNECT_REQUIRED".equals(getMyAccount(userId).get("sync_status"));
    }

    private JsonNode exchangeMetaCode(String code) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(GRAPH_HOST + "/" + apiVersion + "/oauth/access_token")
                    .queryParam("client_id", appId)
                    .queryParam("client_secret", appSecret)
                    .queryParam("redirect_uri", redirectUri)
                    .queryParam("code", code)
                    .build().encode().toUri();
            JsonNode response = http.get().uri(uri).retrieve().body(JsonNode.class);
            return unwrap(response);
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException("Meta authorization code exchange failed (HTTP " + ex.getStatusCode().value() + ").");
        }
    }

    private JsonNode graphGet(String path, Map<String, String> query) {
        URI uri = UriComponentsBuilder.fromUriString(GRAPH_HOST + "/" + apiVersion + path)
                .queryParams(toQuery(query)).build().encode().toUri();
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                JsonNode response = http.get().uri(uri).retrieve().body(JsonNode.class);
                return unwrap(response);
            } catch (RestClientResponseException ex) {
                int status = ex.getStatusCode().value();
                if ((status == 429 || status >= 500) && attempt < 2) {
                    try { Thread.sleep((attempt + 1L) * 1000L); }
                    catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); throw new IllegalStateException("Instagram sync was interrupted."); }
                    continue;
                }
                if (status == 400 || status == 401 || status == 403) {
                    throw new IllegalStateException("Instagram denied this data request. Check the granted permissions and account type.");
                }
                throw new IllegalStateException("Instagram API request failed (HTTP " + status + ").");
            }
        }
        throw new IllegalStateException("Instagram API is temporarily unavailable.");
    }

    private org.springframework.util.MultiValueMap<String, String> toQuery(Map<String, String> values) {
        MultiValueMap<String, String> query = new LinkedMultiValueMap<>();
        values.forEach(query::add);
        return query;
    }

    private JsonNode unwrap(JsonNode node) {
        if (node == null) throw new IllegalStateException("Instagram returned an empty response.");
        JsonNode data = node.path("data");
        return data.isArray() && data.size() == 1 && data.get(0).has("access_token") ? data.get(0) : node;
    }

    private void addLatestMetrics(Map<String, Object> metrics, JsonNode values) {
        for (JsonNode metric : values) {
            String name = text(metric, "name", null);
            JsonNode points = metric.path("values");
            if (name == null) continue;
            JsonNode totalValue = metric.path("total_value");
            if (!totalValue.isMissingNode() && !totalValue.isNull()) {
                metrics.put(name, totalValue);
                continue;
            }
            if (!points.isArray() || points.isEmpty()) continue;
            JsonNode point = points.get(points.size() - 1);
            JsonNode value = point.path("value");
            if (value.isNumber()) metrics.put(name, value.numberValue());
            else if (value.isObject() || value.isArray()) metrics.put(name, value);
        }
    }

    private Map<String, Object> snapshot(Instant at, String raw) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("capturedAt", at);
        snapshot.put("metrics", parseJson(raw));
        return snapshot;
    }

    private Object parseJson(String raw) {
        if (raw == null) return null;
        try { return json.readValue(raw, Object.class); }
        catch (Exception ex) { return null; }
    }

    private String toJson(Object value) {
        try { return json.writeValueAsString(value); }
        catch (Exception ex) { throw new IllegalStateException("Could not store Instagram metrics.", ex); }
    }

    private void notifyWorkflow(UUID userId, String error) {
        if (n8nWebhookUrl.isBlank()) return;
        try {
            http.post().uri(n8nWebhookUrl).contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("userId", userId.toString(), "event", "instagram_sync_failed", "error", error)).retrieve().toBodilessEntity();
        } catch (RuntimeException ex) {
            log.warn("Could not notify the Instagram n8n workflow for creator {}", userId);
        }
    }

    private String safeError(RuntimeException ex) {
        String message = ex.getMessage();
        if (message == null || message.isBlank()) return "Instagram sync failed. Please retry or reconnect the account.";
        return message.length() > 240 ? message.substring(0, 240) : message;
    }

    private void requireMetaConfiguration() {
        if (appId.isBlank() || appSecret.isBlank() || redirectUri.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Instagram connection is not configured yet.");
        }
        if (loginConfigId.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Meta Instagram Unified Login configuration ID is missing.");
        }
        try {
            cipher.encrypt("configuration-check");
        } catch (IllegalStateException ex) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Instagram token encryption key is missing or invalid.");
        }
    }

    private String newState() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch (Exception ex) { throw new IllegalStateException("Could not secure Instagram login state", ex); }
    }

    private String requiredText(JsonNode node, String key) {
        String value = text(node, key, null);
        if (value == null || value.isBlank()) throw new IllegalStateException("Instagram response is missing " + key + ".");
        return value;
    }

    private String text(JsonNode node, String key, String fallback) {
        JsonNode value = node == null ? null : node.get(key);
        return value == null || value.isNull() || value.asText().isBlank() ? fallback : value.asText();
    }

    private int number(JsonNode node, String key) {
        return node == null || !node.path(key).canConvertToInt() ? 0 : node.path(key).asInt();
    }

    private Instant instantOrNull(String value) {
        if (value == null) return null;
        try { return Instant.parse(value); }
        catch (Exception ex) { return null; }
    }

    private Instant toInstant(Object value) {
        if (value instanceof java.sql.Timestamp timestamp) return timestamp.toInstant();
        if (value instanceof java.time.OffsetDateTime dateTime) return dateTime.toInstant();
        if (value instanceof Instant instant) return instant;
        throw new IllegalStateException("Instagram token timing data is unavailable.");
    }
}
