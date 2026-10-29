package com.hyperniche.applications;

import com.hyperniche.applications.dto.ApplicationRequest;
import com.hyperniche.applications.dto.ApplicationResponse;
import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Applications", description = "Campaign applications and pipeline management")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Creator applies to an active campaign")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.applyToCampaign(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Application submitted", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Get applications submitted by authenticated creator")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getMyApplications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ApplicationResponse> list = applicationService.getMyApplications(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/campaign/{campaignId}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get all applications for a brand's campaign")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getCampaignApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("campaignId") UUID campaignId
    ) {
        List<ApplicationResponse> list = applicationService.getCampaignApplications(principal.getId(), campaignId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/brand")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get all applications for the authenticated brand across their campaigns")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getBrandApplications(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ApplicationResponse> list = applicationService.getBrandApplications(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update application status (ACCEPTED, DECLINED)")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        ApplicationResponse response = applicationService.updateApplicationStatus(principal.getId(), id, status);
        return ResponseEntity.ok(ApiResponse.success("Application status updated", response));
    }
}
