package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {

    private final ChatMessageRepository chatMessageRepository;

    @Override
    public ChatMessage saveMessage(String sessionId, String username, String content, ChatMessage.MessageType type) {
        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .username(username)
                .content(content)
                .type(type)
                .timestamp(LocalDateTime.now())
                .build();
        ChatMessage saved = chatMessageRepository.save(message);
        log.debug("Saved chat message: {} from {}", saved.getId(), username);
        return saved;
    }

    @Override
    public List<ChatMessage> getRecentMessages(int limit) {
        return chatMessageRepository.findRecentMessages(limit);
    }

    @Override
    public Page<ChatMessage> getMessagesByPage(Pageable pageable) {
        return chatMessageRepository.findAll(pageable);
    }
}
