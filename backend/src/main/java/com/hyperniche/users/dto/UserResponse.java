package com.hyperniche.users.dto;

import com.hyperniche.users.User;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String role,
    String displayName,
    String avatarUrl,
    String bio,
    Instant createdAt
) {
    public static UserResponse fromEntity(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getRole(),
            user.getDisplayName(),
            user.getAvatarUrl(),
            user.getBio(),
            user.getCreatedAt()
        );
    }
}
