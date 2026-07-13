package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.adapter.in.web.dto.response.ChatMessageResponse;
import com.kscold.blog.chat.application.dto.SendUserMessageCommand;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatUseCase chatUseCase;
    private final UserQueryPort userQueryPort;

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getMyMessages(
            @AuthenticationPrincipal String userId, @RequestParam(defaultValue = "50") int limit) {
        chatUseCase.markAdminMessagesRead(userId);
        return ResponseEntity.ok(
                ApiResponse.success(
                        ChatMessageResponse.from(
                                chatUseCase.getRecentMessagesByRoom(userId, limit))));
    }

    @PostMapping("/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @AuthenticationPrincipal String userId,
            @RequestBody @Valid SendUserMessageCommand command) {
        String displayName = userQueryPort.getUserById(userId).displayName();
        ChatMessage saved =
                chatUseCase.saveAndBroadcast(
                        "user-rest",
                        displayName,
                        command.content().trim(),
                        ChatMessage.MessageType.TEXT,
                        userId,
                        false);
        return ResponseEntity.ok(ApiResponse.success(ChatMessageResponse.from(saved)));
    }
}
