package com.kscold.blog.chat.adapter.in.ws;

import org.springframework.web.socket.WebSocketSession;

record ChatSessionInfo(
        WebSocketSession session,
        String userId,
        String username,
        boolean isAdmin,
        long credentialVersion) {}
