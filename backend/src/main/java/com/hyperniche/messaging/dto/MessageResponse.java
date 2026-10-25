package com.hyperniche.messaging.dto;

import com.hyperniche.messaging.Message;
import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
    UUID id,
    UUID conversationId,
    UUID senderId,
    String senderName,
    String senderAvatar,
    String messageText,
    Boolean isRead,
    Instant createdAt
) {
    public static MessageResponse fromEntity(Message m) {
        String name = m.getSender() != null ? m.getSender().getDisplayName() : "";
        String avatar = m.getSender() != null ? m.getSender().getAvatarUrl() : "";

        return new MessageResponse(
            m.getId(),
            m.getConversation() != null ? m.getConversation().getId() : null,
            m.getSender() != null ? m.getSender().getId() : null,
            name,
            avatar,
            m.getMessageText(),
            m.getIsRead(),
            m.getCreatedAt()
        );
    }
}
