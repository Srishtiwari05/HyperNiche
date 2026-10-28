package com.hyperniche.campaigns;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import com.hyperniche.campaigns.dto.CampaignRequest;
import com.hyperniche.campaigns.dto.CampaignResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/campaigns")
@Tag(name = "Campaigns", description = "Campaign exploration and brand campaign creation")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    @Operation(summary = "Browse active campaigns with category and platform filters")
    public ResponseEntity<ApiResponse<Page<CampaignResponse>>> listCampaigns(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "platform", required = false) String platform,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<CampaignResponse> campaigns = campaignService.listActiveCampaigns(category, platform, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(campaigns));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campaign details by ID")
    public ResponseEntity<ApiResponse<CampaignResponse>> getCampaign(@PathVariable("id") UUID id) {
        CampaignResponse response = campaignService.getCampaignById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Get authenticated brand's own campaigns")
    public ResponseEntity<ApiResponse<List<CampaignResponse>>> getMyCampaigns(@AuthenticationPrincipal UserPrincipal principal) {
        List<CampaignResponse> list = campaignService.getMyCampaigns(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Create a new campaign")
    public ResponseEntity<ApiResponse<CampaignResponse>> createCampaign(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CampaignRequest request
    ) {
        CampaignResponse created = campaignService.createCampaign(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Campaign created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Update an existing campaign owned by authenticated brand")
    public ResponseEntity<ApiResponse<CampaignResponse>> updateCampaign(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id,
            @Valid @RequestBody CampaignRequest request
    ) {
        CampaignResponse updated = campaignService.updateCampaign(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Campaign updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('BRAND')")
    @Operation(summary = "Delete an existing campaign owned by authenticated brand")
    public ResponseEntity<ApiResponse<Void>> deleteCampaign(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id
    ) {
        campaignService.deleteCampaign(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Campaign deleted", null));
    }
}
