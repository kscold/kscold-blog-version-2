package com.kscold.blog.chat.domain.port.out;

import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatMessageRepository {

    ChatMessage save(ChatMessage message);

    List<ChatMessage> findRecentByRoomId(String roomId, int limit);

    Page<ChatMessage> findByRoomId(String roomId, Pageable pageable);

    Page<ChatMessage> findAll(Pageable pageable);

    List<ChatRoomSummary> findAllRooms();

    record ChatRoomSummary(String roomId, String username, String lastMessage, String lastTimestamp, long messageCount) {}
}
