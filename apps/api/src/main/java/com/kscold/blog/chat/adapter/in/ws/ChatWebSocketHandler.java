package com.kscold.blog.chat.adapter.in.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import jakarta.annotation.PostConstruct;
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
public class ChatWebSocketHandler extends TextWebSocketHandler implements ChatBroadcastPort {

    private final ChatUseCase chatUseCase;
    private final ObjectMapper objectMapper;
    private final com.kscold.blog.chat.adapter.out.discord.DiscordBridgeService discordBridge;

    @PostConstruct
    void init() {
        // 디스코드에서 관리자 답장 → 블로그 방문자에게 WebSocket 전달
        discordBridge.setBlogMessageCallback((roomId, adminName, content) -> {
            Map<String, Object> msg = new LinkedHashMap<>();
            msg.put("type", "message");
            msg.put("id", String.valueOf(System.currentTimeMillis()));
            msg.put("roomId", roomId);
            msg.put("username", adminName);
            msg.put("content", content);
            msg.put("fromAdmin", true);
            msg.put("timestamp", LocalDateTime.now().toString());

            broadcastToUserSessions(roomId, msg);
            broadcastToAdmins(msg);
        });
    }

    // sessionId → 세션 정보
    private record SessionInfo(WebSocketSession session, String userId, String username, boolean isAdmin) {}
    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        String userId   = (String) session.getAttributes().get("userId");
        String username = (String) session.getAttributes().get("username");
        Boolean isAdmin = (Boolean) session.getAttributes().getOrDefault("isAdmin", false);

        sessions.put(sessionId, new SessionInfo(session, userId, username, isAdmin));
        log.info("WebSocket connected: {} as {} (admin={})", sessionId, username, isAdmin);

        if (isAdmin) {
            // 어드민: 현재 접속 중인 방문자 목록 전송
            sendRoomList(session);
        } else {
            // 방문자: 자신의 방 히스토리 전송
            List<ChatMessage> history = chatUseCase.getRecentMessagesByRoom(userId, 50);
            List<Map<String, Object>> historyList = history.stream().map(this::toMessageMap).toList();
            sendToSession(session, Map.of("type", "history", "messages", historyList));

            // 입장 시스템 메시지
            chatUseCase.saveMessage(sessionId, "SYSTEM", username + "님이 입장했습니다",
                    ChatMessage.MessageType.SYSTEM, userId, false);

            // 어드민에게 새 방문자 알림
            broadcastToAdmins(Map.of("type", "room_joined", "userId", userId, "username", username));

            // 디스코드에 입장 알림
            discordBridge.sendSystemToDiscord(userId, username + "님이 입장했습니다");
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        SessionInfo info = sessions.get(sessionId);
        if (info == null) return;

        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type    = payload.get("type");
        String content = payload.get("content");
        if (!"message".equals(type) || content == null || content.isBlank()) return;

        if (!info.isAdmin()) {
            // 방문자 → 저장 후 자신 + 어드민에게 전송
            ChatMessage saved = chatUseCase.saveMessage(
                    sessionId, info.username(), content.trim(),
                    ChatMessage.MessageType.TEXT, info.userId(), false);

            Map<String, Object> msg = toMessageMap(saved);
            broadcastToUserSessions(info.userId(), msg);
            broadcastToAdmins(msg);

            // 디스코드로 전달
            discordBridge.sendToDiscord(info.userId(), info.username(), content.trim());
        } else {
            // 어드민 → toUserId 지정 방문자에게 전송 (자기 자신에게는 불가)
            String toUserId = payload.get("toUserId");
            if (toUserId == null || toUserId.isBlank()) return;
            if (toUserId.equals(info.userId())) return;

            ChatMessage saved = chatUseCase.saveMessage(
                    sessionId, info.username(), content.trim(),
                    ChatMessage.MessageType.TEXT, toUserId, true);

            Map<String, Object> msg = toMessageMap(saved);
            broadcastToUserSessions(toUserId, msg);
            broadcastToAdmins(msg);

            // 웹 어드민 답장도 디스코드에 로깅
            discordBridge.sendAdminReplyToDiscord(toUserId, info.username(), content.trim());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        SessionInfo info = sessions.remove(session.getId());
        if (info == null) return;

        log.info("WebSocket disconnected: {} ({})", session.getId(), info.username());

        if (!info.isAdmin()) {
            chatUseCase.saveMessage(session.getId(), "SYSTEM", info.username() + "님이 퇴장했습니다",
                    ChatMessage.MessageType.SYSTEM, info.userId(), false);
            broadcastToAdmins(Map.of("type", "room_left", "userId", info.userId(), "username", info.username()));

            // 디스코드에 퇴장 알림
            discordBridge.sendSystemToDiscord(info.userId(), info.username() + "님이 퇴장했습니다");
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }

    // --- helpers ---

    private void broadcastToAdmins(Map<String, Object> payload) {
        sessions.values().stream()
                .filter(SessionInfo::isAdmin)
                .forEach(i -> sendToSession(i.session(), payload));
    }

    private void broadcastToUserSessions(String userId, Map<String, Object> payload) {
        sessions.values().stream()
                .filter(i -> !i.isAdmin() && userId.equals(i.userId()))
                .forEach(i -> sendToSession(i.session(), payload));
    }

    private void sendRoomList(WebSocketSession session) {
        List<Map<String, Object>> rooms = sessions.values().stream()
                .filter(i -> !i.isAdmin())
                .map(i -> {
                    Map<String, Object> room = new LinkedHashMap<>();
                    room.put("userId", i.userId());
                    room.put("username", i.username());
                    room.put("online", true);
                    return room;
                })
                .distinct()
                .toList();
        sendToSession(session, Map.of("type", "room_list", "rooms", rooms));
    }

    private void sendToSession(WebSocketSession session, Map<String, Object> payload) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
            }
        } catch (Exception e) {
            log.error("Failed to send to session {}: {}", session.getId(), e.getMessage());
        }
    }

    private Map<String, Object> toMessageMap(ChatMessage msg) {
        Map<String, Object> map = new LinkedHashMap<>();
        boolean isSystem = msg.getType() == ChatMessage.MessageType.SYSTEM;
        map.put("type", isSystem ? "system" : "message");
        map.put("id", msg.getId() != null ? msg.getId() : "");
        map.put("roomId", msg.getRoomId() != null ? msg.getRoomId() : "");
        map.put("username", msg.getUsername() != null ? msg.getUsername() : "");
        map.put("content", msg.getContent() != null ? msg.getContent() : "");
        map.put("fromAdmin", msg.isFromAdmin());
        map.put("timestamp", msg.getTimestamp() != null ? msg.getTimestamp().toString() : LocalDateTime.now().toString());
        return map;
    }

    @Override
    public void broadcast(ChatMessage message) {
        Map<String, Object> payload = toMessageMap(message);
        broadcastToAdmins(payload);
        if (message.getRoomId() != null) {
            broadcastToUserSessions(message.getRoomId(), payload);
        }
    }
}
