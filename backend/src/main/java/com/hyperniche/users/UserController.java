package com.hyperniche.users;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import com.hyperniche.users.dto.UserResponse;
import com.hyperniche.users.dto.UserSyncRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User profile and sync operations")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        UserResponse response = userService.getUserById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/sync")
    @Operation(summary = "Sync Supabase authenticated user into application database")
    public ResponseEntity<ApiResponse<UserResponse>> syncUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserSyncRequest request
    ) {
        UUID authenticatedId = principal != null ? principal.getId() : request.id();
        UserResponse response = userService.syncUser(authenticatedId, request);
        return ResponseEntity.ok(ApiResponse.success("User synchronized successfully", response));
    }
}
