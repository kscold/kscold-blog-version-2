package com.kscold.blog.chat.adapter.in.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class ChatSessionRegistryConcurrencyTest {

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
    void slowSnapshotValidationDoesNotBlockSessionRevocation() throws Exception {
        currentUsers.put("user-1", authentication("user-1", 1L));
        WebSocketSession session = connect("session-1", "user-1");
        CountDownLatch validationStarted = new CountDownLatch(1);
        CountDownLatch releaseValidation = new CountDownLatch(1);
        blockAuthenticationLookup("user-1", validationStarted, releaseValidation);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        Future<List<ValidatedChatSession>> snapshot = null;

        try {
            snapshot = executor.submit(sessionRegistry::validSnapshot);
            assertThat(validationStarted.await(1, TimeUnit.SECONDS)).isTrue();
            Future<?> revocation = executor.submit(() -> sessionRegistry.revoke("user-1"));

            revocation.get(1, TimeUnit.SECONDS);
            verify(session).close(CloseStatus.POLICY_VIOLATION);
            releaseValidation.countDown();
            assertThat(snapshot.get(1, TimeUnit.SECONDS)).isEmpty();
        } finally {
            releaseValidation.countDown();
            cancelIfRunning(snapshot);
            executor.shutdownNow();
        }
    }

    @Test
    void revocationDuringSlowRegistrationPreventsStaleSessionRegistration() throws Exception {
        currentUsers.put("user-1", authentication("user-1", 1L));
        currentUsers.put("user-2", authentication("user-2", 1L));
        WebSocketSession session = newSession("session-1", "user-1");
        WebSocketSession otherSession = newSession("session-2", "user-2");
        CountDownLatch validationStarted = new CountDownLatch(1);
        CountDownLatch releaseValidation = new CountDownLatch(1);
        blockAuthenticationLookup("user-1", validationStarted, releaseValidation);
        ExecutorService executor = Executors.newFixedThreadPool(3);
        Future<?> registration = null;

        try {
            registration = executor.submit(() -> establish(session));
            assertThat(validationStarted.await(1, TimeUnit.SECONDS)).isTrue();
            executor.submit(() -> establish(otherSession)).get(1, TimeUnit.SECONDS);
            assertThat(sessionRegistry.get("session-2")).isNotNull();

            executor.submit(() -> sessionRegistry.revoke("user-1")).get(1, TimeUnit.SECONDS);
            releaseValidation.countDown();
            registration.get(1, TimeUnit.SECONDS);

            assertThat(sessionRegistry.get("session-1")).isNull();
            verify(session).close(CloseStatus.POLICY_VIOLATION);
            assertThat(sessionRegistry.get(connect("session-3", "user-1").getId())).isNotNull();
        } finally {
            releaseValidation.countDown();
            cancelIfRunning(registration);
            executor.shutdownNow();
        }
    }

    @Test
    void revokeDuringSlowInboundValidationPreventsMessageHandling() throws Exception {
        currentUsers.put("user-1", authentication("user-1", 1L));
        WebSocketSession session = connect("session-1", "user-1");
        clearInvocations(chatUseCase, session);
        CountDownLatch validationStarted = new CountDownLatch(1);
        CountDownLatch releaseValidation = new CountDownLatch(1);
        blockAuthenticationLookup("user-1", validationStarted, releaseValidation);
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<?> inbound = null;

        try {
            TextMessage message = message("차단할 메시지");
            inbound = executor.submit(() -> handleMessage(session, message));
            assertThat(validationStarted.await(1, TimeUnit.SECONDS)).isTrue();

            handler.revokeUserSessions("user-1");
            verify(session).close(CloseStatus.POLICY_VIOLATION);
            releaseValidation.countDown();
            inbound.get(1, TimeUnit.SECONDS);

            assertThat(sessionRegistry.get("session-1")).isNull();
            verify(chatUseCase, never())
                    .saveAndBroadcast(
                            any(),
                            any(),
                            any(),
                            any(ChatMessage.MessageType.class),
                            any(),
                            anyBoolean());
        } finally {
            releaseValidation.countDown();
            cancelIfRunning(inbound);
            executor.shutdownNow();
        }
    }

    private void blockAuthenticationLookup(
            String userId, CountDownLatch started, CountDownLatch release) {
        when(userQueryPort.findAuthenticationById(userId))
                .thenAnswer(
                        invocation -> {
                            started.countDown();
                            release.await(2, TimeUnit.SECONDS);
                            return Optional.of(currentUsers.get(userId));
                        });
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

    private UserQueryPort.AuthenticationInfo authentication(String userId, long version) {
        return new UserQueryPort.AuthenticationInfo(userId, userId, false, version);
    }

    private TextMessage message(String content) throws Exception {
        return new TextMessage(
                objectMapper.writeValueAsString(Map.of("type", "message", "content", content)));
    }

    private Void establish(WebSocketSession session) throws Exception {
        handler.afterConnectionEstablished(session);
        return null;
    }

    private Void handleMessage(WebSocketSession session, TextMessage message) throws Exception {
        handler.handleTextMessage(session, message);
        return null;
    }

    private void cancelIfRunning(Future<?> future) {
        if (future != null && !future.isDone()) future.cancel(true);
    }
}
