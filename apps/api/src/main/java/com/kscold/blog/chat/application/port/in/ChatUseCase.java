package com.kscold.blog.chat.application.port.in;

import com.kscold.blog.chat.application.dto.response.ChatRoomSummaryResponse;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatMessageRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChatUseCase {

    ChatMessage saveMessage(
            String sessionId,
            String username,
            String content,
            ChatMessage.MessageType type,
            String roomId,
            boolean fromAdmin);

    /** 저장 + WebSocket 브로드캐스트 + 외부 알림 (블로그에서 발신한 메시지용) */
    ChatMessage saveAndBroadcast(
            String sessionId,
            String username,
            String content,
            ChatMessage.MessageType type,
            String roomId,
            boolean fromAdmin);

    /** 디스코드(외부)에서 온 주인 답장을 저장하고 방문자에게 브로드캐스트한다. 외부에서 이미 발신된 메시지이므로 디스코드로 다시 알리지 않는다(에코 방지). */
    ChatMessage receiveOwnerReply(
            String sessionId, String ownerName, String content, String roomId);

    /** 방문자 입장/퇴장 등 시스템 이벤트를 저장하고 외부 채널에 알림. */
    void recordSystemEvent(String roomId, String content);

    List<ChatMessage> getRecentMessagesByRoom(String roomId, int limit);

    Page<ChatMessage> getMessagesByRoom(String roomId, Pageable pageable);

    Page<ChatMessage> getAllMessages(Pageable pageable);

    List<ChatRoomSummaryResponse> getAllRooms();

    void markAdminMessagesRead(String roomId);

    List<ChatMessageRepository.PendingAdminReminder> getPendingAdminReminders(
            LocalDateTime unreadBefore);

    void markReminderSent(String roomId, LocalDateTime unreadBefore);
}
