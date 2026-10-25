package com.hyperniche.applications.dto;

import com.hyperniche.applications.Application;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ApplicationResponse(
    UUID id,
    UUID campaignId,
    String campaignTitle,
    UUID creatorId,
    String creatorName,
    String creatorAvatar,
    String pitch,
    BigDecimal proposedRateInr,
    String status,
    Instant createdAt
) {
    public static ApplicationResponse fromEntity(Application a) {
        String campaignTitle = a.getCampaign() != null ? a.getCampaign().getTitle() : "";
        String creatorName = a.getCreator() != null ? a.getCreator().getDisplayName() : "";
        String creatorAvatar = a.getCreator() != null ? a.getCreator().getAvatarUrl() : "";

        return new ApplicationResponse(
            a.getId(),
            a.getCampaign() != null ? a.getCampaign().getId() : null,
            campaignTitle,
            a.getCreator() != null ? a.getCreator().getId() : null,
            creatorName,
            creatorAvatar,
            a.getPitch(),
            a.getProposedRateInr(),
            a.getStatus(),
            a.getCreatedAt()
        );
    }
}
