package com.hyperniche.users.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.UUID;

public record UserSyncRequest(
    UUID id,
    @NotBlank @Email String email,
    String role,
    @NotBlank String displayName,
    String avatarUrl,
    String bio,
    String handle,
    String niche,
    Integer followersCount,
    String websiteUrl,
    BigDecimal rateReelInr,
    String companyName,
    String industry,
    String whatYouSell
) {}
