package com.kscold.blog.chat.adapter.in.web;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/chat")
@RequiredArgsConstructor
public class ChatAdminController {

    private final ChatUseCase chatUseCase;

    @GetMapping("/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ChatMessage>>> getMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<ChatMessage> messages = chatUseCase.getMessagesByPage(pageable);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
