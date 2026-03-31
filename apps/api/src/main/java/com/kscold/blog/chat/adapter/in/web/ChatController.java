package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.adapter.out.discord.DiscordBridgeService;
import com.kscold.blog.chat.application.dto.SendUserMessageCommand;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatUseCase chatUseCase;
    private final UserQueryPort userQueryPort;
    private final ChatBroadcastPort chatBroadcastPort;
    private final DiscordBridgeService discordBridgeService;

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMyMessages(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getRecentMessagesByRoom(userId, limit)));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @AuthenticationPrincipal String userId,
            @RequestBody @Valid SendUserMessageCommand command
    ) {
        String displayName = userQueryPort.getUserById(userId).displayName();
        ChatMessage saved = chatUseCase.saveMessage(
                "user-rest", displayName, command.content().trim(),
                ChatMessage.MessageType.TEXT, userId, false);
        chatBroadcastPort.broadcast(saved);
        discordBridgeService.sendToDiscord(userId, displayName, command.content().trim());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }
}
