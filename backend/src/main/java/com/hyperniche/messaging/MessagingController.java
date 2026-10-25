package com.hyperniche.messaging;

import com.hyperniche.common.ApiResponse;
import com.hyperniche.common.UserPrincipal;
import com.hyperniche.messaging.dto.ConversationResponse;
import com.hyperniche.messaging.dto.MessageResponse;
import com.hyperniche.messaging.dto.SendMessageRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/conversations")
@Tag(name = "Messaging", description = "In-app real-time persistent messaging between brands and creators")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @GetMapping
    @Operation(summary = "List all active conversations for authenticated user")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<ConversationResponse> list = messagingService.getUserConversations(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}/messages")
    @Operation(summary = "Get message history for a conversation")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") UUID id
    ) {
        List<MessageResponse> list = messagingService.getConversationMessages(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/messages")
    @Operation(summary = "Send a message with automatic safety and anti-circumvention checks")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SendMessageRequest request
    ) {
        MessageResponse response = messagingService.sendMessage(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent", response));
    }
}
