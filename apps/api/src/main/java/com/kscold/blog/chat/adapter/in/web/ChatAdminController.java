package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.application.dto.ChatRoomSummaryDto;
import com.kscold.blog.chat.application.dto.SendAdminMessageCommand;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.adapter.in.ws.ChatWebSocketHandler;
import com.kscold.blog.chat.adapter.out.discord.DiscordBridgeService;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/chat")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ChatAdminController {

    private final ChatUseCase chatUseCase;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final DiscordBridgeService discordBridgeService;

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoomSummaryDto>>> getRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getAllRooms()));
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @PathVariable String roomId,
            @RequestBody @Valid SendAdminMessageCommand command
    ) {
        ChatMessage saved = chatUseCase.saveMessage(
                "admin-rest", command.resolvedUsername(), command.content().trim(),
                ChatMessage.MessageType.TEXT, roomId, true);
        chatWebSocketHandler.publishSavedMessage(saved);
        discordBridgeService.sendAdminReplyToDiscord(roomId, command.resolvedUsername(), command.content().trim());
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "timestamp"));
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getMessagesByRoom(roomId, pageable)));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getAllMessages(pageable)));
    }
}
