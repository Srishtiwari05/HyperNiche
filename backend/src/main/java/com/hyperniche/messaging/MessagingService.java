package com.hyperniche.messaging;

import com.hyperniche.campaigns.Campaign;
import com.hyperniche.campaigns.CampaignRepository;
import com.hyperniche.messaging.dto.ConversationResponse;
import com.hyperniche.messaging.dto.MessageResponse;
import com.hyperniche.messaging.dto.SendMessageRequest;
import com.hyperniche.safety.SafetyModerationService;
import com.hyperniche.users.User;
import com.hyperniche.users.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final SafetyModerationService moderationService;

    public MessagingService(
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            UserRepository userRepository,
            CampaignRepository campaignRepository,
            SafetyModerationService moderationService
    ) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.moderationService = moderationService;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getUserConversations(UUID userId) {
        return conversationRepository.findUserConversations(userId).stream()
                .map(ConversationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getConversationMessages(UUID userId, UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!conversation.getBrand().getId().equals(userId) && !conversation.getCreator().getId().equals(userId)) {
            throw new AccessDeniedException("You are not a participant in this conversation");
        }

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        // 1. Content Safety & Anti-Circumvention check
        var safetyCheck = moderationService.validateContent(request.messageText());
        if (!safetyCheck.allowed()) {
            throw new IllegalArgumentException(safetyCheck.reason());
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Conversation conversation;
        if (request.conversationId() != null) {
            conversation = conversationRepository.findById(request.conversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

            if (!conversation.getBrand().getId().equals(senderId) && !conversation.getCreator().getId().equals(senderId)) {
                throw new AccessDeniedException("You are not a participant in this conversation");
            }
        } else {
            if (request.recipientId() == null) {
                throw new IllegalArgumentException("Recipient ID is required to start a new conversation");
            }

            User recipient = userRepository.findById(request.recipientId())
                    .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

            User brand = "BRAND".equalsIgnoreCase(sender.getRole()) ? sender : recipient;
            User creator = "CREATOR".equalsIgnoreCase(sender.getRole()) ? sender : recipient;

            Campaign campaign = null;
            if (request.campaignId() != null) {
                campaign = campaignRepository.findById(request.campaignId()).orElse(null);
            }

            final Campaign fCampaign = campaign;
            conversation = conversationRepository.findExisting(brand.getId(), creator.getId(), request.campaignId())
                    .orElseGet(() -> {
                        Conversation c = new Conversation();
                        c.setBrand(brand);
                        c.setCreator(creator);
                        c.setCampaign(fCampaign);
                        return conversationRepository.save(c);
                    });
        }

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessageText(request.messageText());
        message.setIsRead(false);

        conversation.preUpdate();
        conversationRepository.save(conversation);

        Message saved = messageRepository.save(message);
        return MessageResponse.fromEntity(saved);
    }
}
