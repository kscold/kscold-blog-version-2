package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.application.dto.ChatRoomSummaryDto;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatApplicationService implements ChatUseCase {

    private final ChatMessageRepository chatMessageRepository;

    @Override
    @Transactional
    public ChatMessage saveMessage(String sessionId, String username, String content,
                                   ChatMessage.MessageType type, String roomId, boolean fromAdmin) {
        ChatMessage message = ChatMessage.builder()
                .sessionId(sessionId)
                .roomId(roomId)
                .username(username)
                .content(content)
                .type(type)
                .fromAdmin(fromAdmin)
                .timestamp(LocalDateTime.now())
                .build();
        return chatMessageRepository.save(message);
    }

    @Override
    public List<ChatMessage> getRecentMessagesByRoom(String roomId, int limit) {
        return chatMessageRepository.findRecentByRoomId(roomId, limit);
    }

    @Override
    public Page<ChatMessage> getMessagesByRoom(String roomId, Pageable pageable) {
        return chatMessageRepository.findByRoomId(roomId, pageable);
    }

    @Override
    public Page<ChatMessage> getAllMessages(Pageable pageable) {
        return chatMessageRepository.findAll(pageable);
    }

    @Override
    public List<ChatRoomSummaryDto> getAllRooms() {
        return chatMessageRepository.findAllRooms().stream()
                .map(s -> new ChatRoomSummaryDto(
                        s.roomId(), s.username(), s.lastMessage(),
                        s.lastTimestamp(), s.messageCount()))
                .toList();
    }
}
