package com.kscold.blog.chat.domain.port.out;

public interface ChatNotificationPort {
    void notifyMessage(String roomId, String username, String content, boolean fromAdmin);
}
