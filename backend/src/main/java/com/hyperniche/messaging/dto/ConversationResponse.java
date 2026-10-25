package com.hyperniche.messaging.dto;

import com.hyperniche.messaging.Conversation;
import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
    UUID id,
    UUID brandId,
    String brandName,
    String brandAvatar,
    UUID creatorId,
    String creatorName,
    String creatorAvatar,
    UUID campaignId,
    String campaignTitle,
    Instant updatedAt
) {
    public static ConversationResponse fromEntity(Conversation c) {
        String brandName = c.getBrand() != null ? c.getBrand().getDisplayName() : "";
        String brandAvatar = c.getBrand() != null ? c.getBrand().getAvatarUrl() : "";
        String creatorName = c.getCreator() != null ? c.getCreator().getDisplayName() : "";
        String creatorAvatar = c.getCreator() != null ? c.getCreator().getAvatarUrl() : "";
        String campaignTitle = c.getCampaign() != null ? c.getCampaign().getTitle() : null;

        return new ConversationResponse(
            c.getId(),
            c.getBrand() != null ? c.getBrand().getId() : null,
            brandName,
            brandAvatar,
            c.getCreator() != null ? c.getCreator().getId() : null,
            creatorName,
            creatorAvatar,
            c.getCampaign() != null ? c.getCampaign().getId() : null,
            campaignTitle,
            c.getUpdatedAt()
        );
    }
}
