package com.kscold.blog.chat.domain.port.out;

public interface ChatRateLimitPort {

    void checkVisitorMessageAllowed(String roomId);

    void checkSystemEventAllowed(String roomId);
}
