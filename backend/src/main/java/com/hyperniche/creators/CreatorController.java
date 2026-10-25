package com.hyperniche.creators;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import com.hyperniche.creators.dto.CreatorProfileDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/creators")
@Tag(name = "Creators", description = "Creator marketplace discovery and profile management")
public class CreatorController {

    private final CreatorService creatorService;

    public CreatorController(CreatorService creatorService) {
        this.creatorService = creatorService;
    }

    @GetMapping
    @Operation(summary = "Browse creators with niche filter and pagination")
    public ResponseEntity<ApiResponse<Page<CreatorProfileDto>>> listCreators(
            @RequestParam(name = "niche", required = false) String niche,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("followersCount").descending());
        Page<CreatorProfileDto> result = creatorService.listCreators(niche, pageRequest);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get creator profile details by user ID")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> getCreator(@PathVariable("id") UUID id) {
        CreatorProfileDto profile = creatorService.getCreatorProfile(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('CREATOR')")
    @Operation(summary = "Update authenticated creator's profile")
    public ResponseEntity<ApiResponse<CreatorProfileDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody CreatorProfileDto dto
    ) {
        CreatorProfileDto updated = creatorService.updateProfile(principal.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success("Creator profile updated", updated));
    }
}
