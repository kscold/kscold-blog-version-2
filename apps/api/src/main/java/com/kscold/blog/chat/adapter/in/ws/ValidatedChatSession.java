package com.kscold.blog.chat.adapter.in.ws;

import com.kscold.blog.identity.application.port.in.UserQueryPort;

record ValidatedChatSession(
        ChatSessionInfo sessionInfo, UserQueryPort.AuthenticationInfo authentication) {}
