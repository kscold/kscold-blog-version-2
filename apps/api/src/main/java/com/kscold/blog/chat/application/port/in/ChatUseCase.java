package com.kscold.blog.chat.application.port.in;

import com.kscold.blog.chat.application.dto.ChatRoomSummaryDto;
import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatUseCase {

    ChatMessage saveMessage(String sessionId, String username, String content,
                            ChatMessage.MessageType type, String roomId, boolean fromAdmin);

    /** 저장 + WebSocket 브로드캐스트 + 외부 알림 (REST 전송용) */
    ChatMessage saveAndBroadcast(String sessionId, String username, String content,
                                 ChatMessage.MessageType type, String roomId, boolean fromAdmin);

    List<ChatMessage> getRecentMessagesByRoom(String roomId, int limit);

    Page<ChatMessage> getMessagesByRoom(String roomId, Pageable pageable);

    Page<ChatMessage> getAllMessages(Pageable pageable);

    List<ChatRoomSummaryDto> getAllRooms();
}
