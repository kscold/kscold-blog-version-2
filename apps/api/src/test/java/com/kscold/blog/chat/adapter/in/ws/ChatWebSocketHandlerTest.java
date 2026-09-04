package com.kscold.blog.chat.adapter.in.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import java.io.IOException;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

class ChatWebSocketHandlerTest {

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
                .thenReturn(Map.of("userId", "admin-1", "username", "admin", "isAdmin", true));
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
