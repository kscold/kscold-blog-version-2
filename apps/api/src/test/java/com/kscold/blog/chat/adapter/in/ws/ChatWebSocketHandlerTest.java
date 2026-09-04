package com.kscold.blog.chat.adapter.in.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class ChatWebSocketHandlerTest {

    @Test
    @DisplayName("시나리오: 허용 길이를 넘긴 웹소켓 메시지는 애플리케이션으로 전달하지 않는다")
    void oversizedWebSocketMessageIsRejectedBeforeApplicationCall() throws Exception {
        ChatUseCase chatUseCase = mock(ChatUseCase.class);
        when(chatUseCase.getRecentMessagesByRoom("user-1", 50)).thenReturn(List.of());
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("session-1");
        when(session.getAttributes())
                .thenReturn(
                        Map.of(
                                "userId", "user-1",
                                "username", "visitor",
                                "isAdmin", false));
        when(session.isOpen()).thenReturn(true);
        ChatWebSocketHandler handler = new ChatWebSocketHandler(chatUseCase, new ObjectMapper());
        handler.afterConnectionEstablished(session);
        clearInvocations(chatUseCase);

        String payload =
                new ObjectMapper()
                        .writeValueAsString(Map.of("type", "message", "content", "가".repeat(1001)));
        handler.handleTextMessage(session, new TextMessage(payload));

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
    @DisplayName("시나리오: 전송 계층 오류 로그에는 원본 예외 메시지를 남기지 않는다")
    void transportErrorLogDoesNotIncludeExceptionMessage() throws Exception {
        String sensitiveMessage = "websocket-sensitive-value";
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("session-1");
        ChatWebSocketHandler handler = newHandler();
        Logger logger = (Logger) LoggerFactory.getLogger(ChatWebSocketHandler.class);
        ListAppender<ILoggingEvent> appender = attach(logger);

        try {
            handler.handleTransportError(session, new IllegalStateException(sensitiveMessage));

            verify(session).close(CloseStatus.SERVER_ERROR);
            assertSanitized(appender, sensitiveMessage, "IllegalStateException");
            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .noneMatch(message -> message.contains("session-1"));
        } finally {
            detach(logger, appender);
        }
    }

    @Test
    @DisplayName("시나리오: 세션 전송 실패 로그에는 원본 예외 메시지를 남기지 않는다")
    void sessionSendFailureLogDoesNotIncludeExceptionMessage() throws Exception {
        String sensitiveMessage = "send-sensitive-value";
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("session-2");
        when(session.getAttributes())
                .thenReturn(
                        Map.of(
                                "userId",
                                "private-admin-id",
                                "username",
                                "private-operator-name",
                                "isAdmin",
                                true));
        when(session.isOpen()).thenReturn(true);
        doThrow(new IOException(sensitiveMessage))
                .when(session)
                .sendMessage(any(TextMessage.class));
        ChatWebSocketHandler handler = newHandler();
        Logger logger = (Logger) LoggerFactory.getLogger(ChatWebSocketHandler.class);
        ListAppender<ILoggingEvent> appender = attach(logger);

        try {
            handler.afterConnectionEstablished(session);

            assertSanitized(appender, sensitiveMessage, "IOException");
            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .allMatch(
                            message ->
                                    !message.contains("session-2")
                                            && !message.contains("private-admin-id")
                                            && !message.contains("private-operator-name"));
        } finally {
            detach(logger, appender);
        }
    }

    @Test
    @DisplayName("시나리오: 연결과 종료 로그에는 세션 및 사용자 식별자를 남기지 않는다")
    void lifecycleLogsDoNotIncludeSessionOrUserIdentity() throws Exception {
        WebSocketSession session = mock(WebSocketSession.class);
        when(session.getId()).thenReturn("private-session-id");
        when(session.getAttributes())
                .thenReturn(
                        Map.of(
                                "userId",
                                "private-user-id",
                                "username",
                                "private-display-name",
                                "isAdmin",
                                true));
        ChatWebSocketHandler handler = newHandler();
        Logger logger = (Logger) LoggerFactory.getLogger(ChatWebSocketHandler.class);
        ListAppender<ILoggingEvent> appender = attach(logger);

        try {
            handler.afterConnectionEstablished(session);
            handler.afterConnectionClosed(session, CloseStatus.NORMAL);

            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .anyMatch(message -> message.contains("connected: admin=true"))
                    .anyMatch(message -> message.contains("disconnected: admin=true"))
                    .allMatch(
                            message ->
                                    !message.contains("private-session-id")
                                            && !message.contains("private-user-id")
                                            && !message.contains("private-display-name"));
        } finally {
            detach(logger, appender);
        }
    }

    private ChatWebSocketHandler newHandler() {
        return new ChatWebSocketHandler(mock(ChatUseCase.class), new ObjectMapper());
    }

    private ListAppender<ILoggingEvent> attach(Logger logger) {
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        return appender;
    }

    private void detach(Logger logger, ListAppender<ILoggingEvent> appender) {
        logger.detachAppender(appender);
        appender.stop();
    }

    private void assertSanitized(
            ListAppender<ILoggingEvent> appender, String sensitiveMessage, String expectedType) {
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .allMatch(message -> !message.contains(sensitiveMessage))
                .anyMatch(message -> message.contains(expectedType));
    }
}
