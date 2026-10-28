package com.hyperniche.campaigns.dto;

import com.hyperniche.campaigns.Campaign;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CampaignResponse(
    UUID id,
    UUID brandId,
    String brandName,
    String brandAvatar,
    String title,
    String description,
    String category,
    String platform,
    BigDecimal budgetInr,
    String requirements,
    LocalDate deadline,
    String status,
    Integer applicationsCount,
    Instant createdAt,
    String imageUrl,
    String contentType
) {
    public static CampaignResponse fromEntity(Campaign c) {
        String name = c.getBrand() != null ? c.getBrand().getDisplayName() : "";
        String avatar = c.getBrand() != null ? c.getBrand().getAvatarUrl() : "";

        return new CampaignResponse(
            c.getId(),
            c.getBrand() != null ? c.getBrand().getId() : null,
            name,
            avatar,
            c.getTitle(),
            c.getDescription(),
            c.getCategory(),
            c.getPlatform(),
            c.getBudgetInr(),
            c.getRequirements(),
            c.getDeadline(),
            c.getStatus(),
            c.getApplicationsCount(),
            c.getCreatedAt(),
            c.getImageUrl(),
            c.getContentType()
        );
    }
}
