package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository.ChatRoomSummary;
import com.kscold.blog.shared.web.ApiResponse;
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
@RequiredArgsConstructor
public class ChatAdminController {

    private final ChatUseCase chatUseCase;

    // 모든 채팅 방 목록 (과거 대화 포함)
    @GetMapping("/rooms")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ChatRoomSummary>>> getRooms() {
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getAllRooms()));
    }

    // 어드민이 특정 방문자에게 메시지 전송 (오프라인 포함)
    @PostMapping("/rooms/{roomId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ChatMessage>> sendMessage(
            @PathVariable String roomId,
            @RequestBody java.util.Map<String, String> body
    ) {
        String content = body.get("content");
        String username = body.getOrDefault("username", "관리자");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("메시지 내용이 필요합니다"));
        }
        ChatMessage saved = chatUseCase.saveMessage(
                "admin-rest", username, content.trim(),
                ChatMessage.MessageType.TEXT, roomId, true);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    // 특정 방의 메시지 (어드민 대화창)
    @GetMapping("/rooms/{roomId}/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "timestamp"));
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getMessagesByRoom(roomId, pageable)));
    }

    // 전체 메시지 (레거시)
    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(ApiResponse.success(chatUseCase.getAllMessages(pageable)));
    }
}
