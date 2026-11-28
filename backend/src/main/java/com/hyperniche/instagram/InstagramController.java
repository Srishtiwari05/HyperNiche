package com.hyperniche.instagram;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/instagram")
public class InstagramController {
    private static final Logger log = LoggerFactory.getLogger(InstagramController.class);
    private final InstagramIntegrationService instagram;

    public InstagramController(InstagramIntegrationService instagram) {
        this.instagram = instagram;
    }

    @PostMapping("/connect")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Map<String, String>>> connect(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(Map.of("authorizationUrl", instagram.beginLogin(principal.getId()))));
    }

    @GetMapping("/callback")
    public RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error
    ) {
        String status = "connected";
        try {
            if (error != null) status = "cancelled";
            else instagram.completeLogin(code, state);
        } catch (RuntimeException ex) {
            status = "error";
            log.warn("Instagram OAuth callback failed: {}", ex.getMessage());
        }
        return new RedirectView(instagram.frontendUrl() + "/profile?instagram=" + status);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> me(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(instagram.getMyAccount(principal.getId())));
    }

    @GetMapping("/me/analytics")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> analytics(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(instagram.getMyAnalytics(principal.getId())));
    }

    @PostMapping("/me/sync")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Map<String, String>>> sync(@AuthenticationPrincipal UserPrincipal principal) {
        instagram.syncOne(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("status", String.valueOf(instagram.getMyAccount(principal.getId()).get("sync_status")))));
    }

    @PatchMapping("/me/visibility")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Void>> visibility(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody VisibilityRequest request
    ) {
        instagram.updateVisibility(principal.getId(), request.discoverable(), request.shareInsights());
        return ResponseEntity.ok(ApiResponse.success("Instagram sharing settings updated", null));
    }

    @DeleteMapping("/me")
    @PreAuthorize("hasRole('CREATOR')")
    public ResponseEntity<ApiResponse<Void>> disconnect(@AuthenticationPrincipal UserPrincipal principal) {
        instagram.disconnect(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Instagram disconnected", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.success(instagram.search(q)));
    }

    @GetMapping("/creators/{creatorId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publicProfile(@PathVariable UUID creatorId) {
        return ResponseEntity.ok(ApiResponse.success(instagram.getPublicProfile(creatorId)));
    }

    @GetMapping("/webhooks")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam(name = "hub.mode", required = false) String mode,
            @RequestParam(name = "hub.verify_token", required = false) String token,
            @RequestParam(name = "hub.challenge", required = false) String challenge
    ) {
        return ResponseEntity.ok(instagram.verifyWebhook(mode, token, challenge));
    }

    @PostMapping("/webhooks")
    public ResponseEntity<Void> webhook(@RequestHeader(name = "X-Hub-Signature-256", required = false) String signature,
                                        @RequestBody byte[] body) {
        if (!instagram.isValidWebhookSignature(signature, body)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        instagram.queueWebhookSync(body);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/workflow-sync")
    public ResponseEntity<ApiResponse<Void>> workflowSync(
            @RequestHeader(name = "X-Instagram-Workflow-Secret", required = false) String secret,
            @RequestBody(required = false) WorkflowSyncRequest request
    ) {
        boolean succeeded = instagram.triggerWorkflowSync(secret, request == null ? null : request.userId());
        return ResponseEntity.status(succeeded ? HttpStatus.OK : HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.success(succeeded ? "Instagram sync workflow completed" : "Instagram sync failed", null));
    }

    public record VisibilityRequest(boolean discoverable, boolean shareInsights) {}
    public record WorkflowSyncRequest(UUID userId) {}
}
