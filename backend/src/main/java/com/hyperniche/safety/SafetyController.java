package com.hyperniche.safety;

import com.hyperniche.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/safety")
@Tag(name = "Safety", description = "Server-side content safety and anti-circumvention validation")
public class SafetyController {

    private final SafetyModerationService moderationService;

    public SafetyController(SafetyModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate text against off-platform contact leaks")
    public ResponseEntity<ApiResponse<SafetyModerationService.SafetyResult>> validateText(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "");
        var result = moderationService.validateContent(text);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
