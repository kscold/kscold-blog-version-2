package com.kscold.blog.chat.domain.port.out;

import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository {

    ChatMessage save(ChatMessage message);

    List<ChatMessage> findRecentByRoomId(String roomId, int limit);

    Page<ChatMessage> findByRoomId(String roomId, Pageable pageable);

    Page<ChatMessage> findAll(Pageable pageable);

    List<ChatRoomSummary> findAllRooms();

    void markAdminMessagesRead(String roomId, LocalDateTime readAt);

    List<PendingAdminReminder> findPendingAdminReminders(LocalDateTime unreadBefore);

    void markReminderSent(String roomId, LocalDateTime unreadBefore, LocalDateTime sentAt);

    record ChatRoomSummary(String roomId, String username, String lastMessage, String lastTimestamp, long messageCount) {}

    record PendingAdminReminder(
            String roomId,
            String adminName,
            String latestContent,
            LocalDateTime latestTimestamp,
            long unreadCount
    ) {}
}
