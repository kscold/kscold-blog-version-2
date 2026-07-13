package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.adapter.in.web.dto.response.ChatMessageResponse;
import com.kscold.blog.chat.application.dto.command.SendAdminMessageCommand;
import com.kscold.blog.chat.application.dto.response.ChatRoomSummaryResponse;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/chat")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ChatAdminController {

    private final ChatUseCase chatUseCase;

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoomSummaryResponse>>> getRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getAllRooms()));
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> sendMessage(
            @PathVariable String roomId, @RequestBody @Valid SendAdminMessageCommand command) {
        ChatMessage saved =
                chatUseCase.saveAndBroadcast(
                        "admin-rest",
                        command.resolvedUsername(),
                        command.getContent().trim(),
                        ChatMessage.MessageType.TEXT,
                        roomId,
                        true);
        return ResponseEntity.ok(ApiResponse.success(ChatMessageResponse.from(saved)));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "timestamp"));
        return ResponseEntity.ok(
                ApiResponse.success(
                        chatUseCase
                                .getMessagesByRoom(roomId, pageable)
                                .map(ChatMessageResponse::from)));
    }

    @GetMapping("/messages")
    public ResponseEntity<ApiResponse<Page<ChatMessageResponse>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(
                ApiResponse.success(
                        chatUseCase.getAllMessages(pageable).map(ChatMessageResponse::from)));
    }
}
