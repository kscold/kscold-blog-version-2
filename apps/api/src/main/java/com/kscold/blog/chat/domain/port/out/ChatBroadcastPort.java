package com.kscold.blog.chat.domain.port.out;

import com.kscold.blog.chat.domain.model.ChatMessage;

public interface ChatBroadcastPort {
    void broadcast(ChatMessage message);
}
