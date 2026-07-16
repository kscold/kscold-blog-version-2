package com.kscold.blog.chat.application.service;

import com.kscold.blog.chat.application.dto.response.ChatRoomSummaryResponse;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import com.kscold.blog.chat.domain.port.out.ChatNotificationPort;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public ChatMessage saveMessage(
            String sessionId,
            String username,
            String content,
            ChatMessage.MessageType type,
            String roomId,
            boolean fromAdmin) {
        ChatMessage message =
                ChatMessage.builder()
                        .sessionId(sessionId)
                        .roomId(roomId)
                        .username(username)
                        .content(content)
                        .type(type)
                        .fromAdmin(fromAdmin)
                        .timestamp(LocalDateTime.now())
                        .visitorReadAt(fromAdmin ? null : LocalDateTime.now())
                        .build();
        return chatMessageRepository.save(message);
    }

    @Override
    @Transactional
    public ChatMessage saveAndBroadcast(
            String sessionId,
            String username,
            String content,
            ChatMessage.MessageType type,
            String roomId,
            boolean fromAdmin) {
        ChatMessage saved = saveMessage(sessionId, username, content, type, roomId, fromAdmin);
        broadcastPort.broadcast(saved);
        notificationPort.notifyMessage(roomId, username, content, fromAdmin);
        return saved;
    }

    @Override
    @Transactional
    public ChatMessage receiveOwnerReply(
            String sessionId, String ownerName, String content, String roomId) {
        // 디스코드에서 온 주인 답장 — 저장 후 방문자 WebSocket으로만 전달(디스코드 재전송 없음)
        ChatMessage saved =
                saveMessage(
                        sessionId, ownerName, content, ChatMessage.MessageType.TEXT, roomId, true);
        broadcastPort.broadcast(saved);
        return saved;
    }

    @Override
    @Transactional
    public void recordSystemEvent(String roomId, String content) {
        saveMessage(roomId, "SYSTEM", content, ChatMessage.MessageType.SYSTEM, roomId, false);
        notificationPort.notifySystem(roomId, content);
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
    public List<ChatRoomSummaryResponse> getAllRooms() {
        return chatMessageRepository.findAllRooms().stream()
                .map(
                        s ->
                                new ChatRoomSummaryResponse(
                                        s.roomId(),
                                        s.username(),
                                        s.lastMessage(),
                                        s.lastTimestamp(),
                                        s.messageCount()))
                .toList();
    }

    @Override
    @Transactional
    public void markAdminMessagesRead(String roomId) {
        chatMessageRepository.markAdminMessagesRead(roomId, LocalDateTime.now());
    }

    @Override
    public List<ChatMessageRepository.PendingAdminReminder> getPendingAdminReminders(
            LocalDateTime unreadBefore) {
        return chatMessageRepository.findPendingAdminReminders(unreadBefore);
    }

    @Override
    @Transactional
    public void markReminderSent(String roomId, LocalDateTime unreadBefore) {
        chatMessageRepository.markReminderSent(roomId, unreadBefore, LocalDateTime.now());
    }
}
