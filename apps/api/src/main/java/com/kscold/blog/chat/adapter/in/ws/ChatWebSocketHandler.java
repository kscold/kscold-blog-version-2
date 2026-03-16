package com.kscold.blog.chat.adapter.in.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatUseCase chatUseCase;
    private final ObjectMapper objectMapper;

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> sessionUsernames = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        String username = (String) session.getAttributes().get("username");

        sessions.put(sessionId, session);
        sessionUsernames.put(sessionId, username);

        log.info("WebSocket connected: {} as {}", sessionId, username);

        // 최근 메시지 히스토리 전송
        List<ChatMessage> history = chatUseCase.getRecentMessages(50);
        List<Map<String, Object>> historyList = history.stream()
                .map(this::toMessageMap)
                .toList();
        sendToSession(session, Map.of("type", "history", "messages", historyList));

        // 접속자 수 전송
        sendToSession(session, Map.of("type", "user_count", "count", sessions.size()));

        // 입장 시스템 메시지 저장 및 브로드캐스트
        ChatMessage systemMsg = chatUseCase.saveMessage(
                sessionId, "SYSTEM", username + "님이 입장했습니다", ChatMessage.MessageType.SYSTEM
        );
        broadcastMessage(toMessageMap(systemMsg));

        // 전체 접속자 수 업데이트 브로드캐스트
        broadcastUserCount();
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String username = sessionUsernames.getOrDefault(sessionId, "익명");

        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = payload.get("type");
        String content = payload.get("content");

        if ("message".equals(type) && content != null && !content.isBlank()) {
            ChatMessage saved = chatUseCase.saveMessage(
                    sessionId, username, content.trim(), ChatMessage.MessageType.TEXT
            );
            broadcastMessage(toMessageMap(saved));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        String username = sessionUsernames.remove(sessionId);
        sessions.remove(sessionId);

        log.info("WebSocket disconnected: {} ({})", sessionId, username);

        if (username != null) {
            ChatMessage systemMsg = chatUseCase.saveMessage(
                    sessionId, "SYSTEM", username + "님이 퇴장했습니다", ChatMessage.MessageType.SYSTEM
            );
            broadcastMessage(toMessageMap(systemMsg));
        }

        broadcastUserCount();
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket transport error for session {}: {}", session.getId(), exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }

    private void broadcastMessage(Map<String, Object> payload) {
        sessions.values().forEach(s -> sendToSession(s, payload));
    }

    private void broadcastUserCount() {
        broadcastMessage(Map.of("type", "user_count", "count", sessions.size()));
    }

    private void sendToSession(WebSocketSession session, Map<String, Object> payload) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
            }
        } catch (Exception e) {
            log.error("Failed to send message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    private Map<String, Object> toMessageMap(ChatMessage msg) {
        Map<String, Object> map = new LinkedHashMap<>();
        boolean isSystem = msg.getType() == ChatMessage.MessageType.SYSTEM;
        map.put("type", isSystem ? "system" : "message");
        map.put("id", msg.getId() != null ? msg.getId() : "");
        map.put("username", msg.getUsername() != null ? msg.getUsername() : "");
        map.put("content", msg.getContent() != null ? msg.getContent() : "");
        map.put("timestamp", msg.getTimestamp() != null ? msg.getTimestamp().toString() : LocalDateTime.now().toString());
        return map;
    }
}
