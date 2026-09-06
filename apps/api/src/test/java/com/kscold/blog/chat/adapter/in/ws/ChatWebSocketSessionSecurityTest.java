package com.kscold.blog.chat.adapter.in.ws;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class ChatWebSocketSessionSecurityTest {

    private final Map<String, UserQueryPort.AuthenticationInfo> currentUsers =
            new ConcurrentHashMap<>();
    private ChatUseCase chatUseCase;
    private UserQueryPort userQueryPort;
    private ChatSessionRegistry sessionRegistry;
    private ChatWebSocketHandler handler;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        chatUseCase = mock(ChatUseCase.class);
        when(chatUseCase.getRecentMessagesByRoom(anyString(), anyInt())).thenReturn(List.of());
        userQueryPort = mock(UserQueryPort.class);
        when(userQueryPort.findAuthenticationById(anyString()))
                .thenAnswer(
                        invocation ->
                                Optional.ofNullable(currentUsers.get(invocation.getArgument(0))));
        objectMapper = new ObjectMapper();
        sessionRegistry = new ChatSessionRegistry(userQueryPort);
        handler = new ChatWebSocketHandler(chatUseCase, objectMapper, sessionRegistry);
    }

    @Test
    void revokeClosesOnlyTheRequestedUsersSessions() throws Exception {
        currentUsers.put("user-1", authentication("user-1", false, 1L));
        currentUsers.put("user-2", authentication("user-2", false, 1L));
        WebSocketSession first = connect("session-1", "user-1");
        WebSocketSession second = connect("session-2", "user-2");
        clearInvocations(chatUseCase, first, second);

        handler.revokeUserSessions("user-1");
        handler.handleTextMessage(second, message("안녕하세요", null));

        verify(first).close(CloseStatus.POLICY_VIOLATION);
        verify(second, never()).close(any(CloseStatus.class));
        verify(chatUseCase)
                .saveAndBroadcast(
                        "session-2",
                        "user-2",
                        "안녕하세요",
                        ChatMessage.MessageType.TEXT,
                        "user-2",
                        false);
    }

    @Test
    void staleCredentialVersionClosesBeforeInboundMessageHandling() throws Exception {
        currentUsers.put("user-1", authentication("user-1", false, 1L));
        WebSocketSession session = connect("session-1", "user-1");
        clearInvocations(chatUseCase, session);
        currentUsers.put("user-1", authentication("user-1", false, 2L));

        handler.handleTextMessage(session, message("차단할 메시지", null));

        verify(session).close(CloseStatus.POLICY_VIOLATION);
        verify(chatUseCase, never())
                .saveAndBroadcast(
                        any(),
                        any(),
                        any(),
                        any(ChatMessage.MessageType.class),
                        any(),
                        anyBoolean());
    }

    @Test
    void changedAdminRoleCannotUseCachedPrivilege() throws Exception {
        currentUsers.put("admin-1", authentication("admin-1", true, 3L));
        WebSocketSession session = connect("session-1", "admin-1");
        clearInvocations(chatUseCase, session);
        currentUsers.put("admin-1", authentication("admin-1", false, 3L));

        handler.handleTextMessage(session, message("관리자 메시지", "user-2"));

        verify(session).close(CloseStatus.POLICY_VIOLATION);
        verify(chatUseCase, never())
                .saveAndBroadcast(
                        any(),
                        any(),
                        any(),
                        any(ChatMessage.MessageType.class),
                        any(),
                        anyBoolean());
    }

    @Test
    void demotedAdminDoesNotReceiveFurtherBroadcasts() throws Exception {
        currentUsers.put("admin-1", authentication("admin-1", true, 1L));
        WebSocketSession session = connect("session-1", "admin-1");
        clearInvocations(session);
        currentUsers.put("admin-1", authentication("admin-1", false, 1L));
        ChatMessage message =
                ChatMessage.builder()
                        .roomId("user-1")
                        .content("새 메시지")
                        .type(ChatMessage.MessageType.TEXT)
                        .build();

        handler.broadcast(message);

        verify(session).close(CloseStatus.POLICY_VIOLATION);
        verify(session, never()).sendMessage(any(TextMessage.class));
    }

    @Test
    void revokeDoesNotPropagateSessionCloseFailure() throws Exception {
        currentUsers.put("user-1", authentication("user-1", false, 1L));
        WebSocketSession session = connect("session-1", "user-1");
        doThrow(new IOException("close failed")).when(session).close(CloseStatus.POLICY_VIOLATION);

        assertDoesNotThrow(() -> handler.revokeUserSessions("user-1"));
    }

    @Test
    void broadcastValidatesEachCurrentSessionOnlyOnce() throws Exception {
        currentUsers.put("admin-1", authentication("admin-1", true, 1L));
        currentUsers.put("user-1", authentication("user-1", false, 1L));
        currentUsers.put("user-2", authentication("user-2", false, 1L));
        connect("admin-session", "admin-1");
        connect("user-session-1", "user-1");
        connect("user-session-2", "user-2");
        clearInvocations(userQueryPort);
        ChatMessage message =
                ChatMessage.builder()
                        .roomId("user-1")
                        .content("관리자 답변")
                        .type(ChatMessage.MessageType.TEXT)
                        .fromAdmin(true)
                        .build();

        handler.broadcast(message);

        verify(userQueryPort, times(1)).findAuthenticationById("admin-1");
        verify(userQueryPort, times(1)).findAuthenticationById("user-1");
        verify(userQueryPort, times(1)).findAuthenticationById("user-2");
        verify(userQueryPort, times(3)).findAuthenticationById(anyString());
    }

    private WebSocketSession connect(String sessionId, String userId) throws Exception {
        WebSocketSession session = newSession(sessionId, userId);
        handler.afterConnectionEstablished(session);
        return session;
    }

    private WebSocketSession newSession(String sessionId, String userId) {
        UserQueryPort.AuthenticationInfo authentication = currentUsers.get(userId);
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn(sessionId);
        when(session.getAttributes())
                .thenReturn(
                        Map.of(
                                "userId",
                                userId,
                                "username",
                                userId,
                                "isAdmin",
                                authentication.isAdmin(),
                                "credentialVersion",
                                authentication.credentialVersion()));
        when(session.isOpen()).thenReturn(true);
        return session;
    }

    private UserQueryPort.AuthenticationInfo authentication(
            String userId, boolean isAdmin, long credentialVersion) {
        return new UserQueryPort.AuthenticationInfo(userId, userId, isAdmin, credentialVersion);
    }

    private TextMessage message(String content, String toUserId) throws Exception {
        Map<String, String> payload = new java.util.LinkedHashMap<>();
        payload.put("type", "message");
        payload.put("content", content);
        if (toUserId != null) payload.put("toUserId", toUserId);
        return new TextMessage(objectMapper.writeValueAsString(payload));
    }
}
