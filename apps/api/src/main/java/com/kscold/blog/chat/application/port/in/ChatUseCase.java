package com.kscold.blog.chat.application.port.in;

import com.kscold.blog.chat.domain.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatUseCase {

    ChatMessage saveMessage(String sessionId, String username, String content, ChatMessage.MessageType type);

    List<ChatMessage> getRecentMessages(int limit);

    Page<ChatMessage> getMessagesByPage(Pageable pageable);
}
