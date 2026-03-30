package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.application.dto.ChatRoomSummaryDto;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatApplicationService implements ChatUseCase {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatBroadcastPort broadcastPort;
    private final ChatNotificationPort notificationPort;

    public ChatApplicationService(
            ChatMessageRepository chatMessageRepository,
            @Lazy ChatBroadcastPort broadcastPort,
            @Lazy ChatNotificationPort notificationPort) {
        this.chatMessageRepository = chatMessageRepository;
        this.broadcastPort = broadcastPort;
        this.notificationPort = notificationPort;
    }

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
    @Transactional
    public ChatMessage saveAndBroadcast(String sessionId, String username, String content,
                                        ChatMessage.MessageType type, String roomId, boolean fromAdmin) {
        ChatMessage saved = saveMessage(sessionId, username, content, type, roomId, fromAdmin);
        broadcastPort.broadcast(saved);
        notificationPort.notifyMessage(roomId, username, content, fromAdmin);
        return saved;
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
