package com.hyperniche.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record SendMessageRequest(
    UUID conversationId,
    UUID recipientId,
    UUID campaignId,
    @NotBlank String messageText
) {}
