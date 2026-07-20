package com.kscold.blog.chat.adapter.in.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.chat.application.port.in.ChatUseCase;
import com.kscold.blog.chat.domain.model.ChatMessage;
import com.kscold.blog.chat.domain.port.out.ChatBroadcastPort;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * 방문자·관리자 WebSocket 어댑터. 외부 알림(디스코드)은 직접 호출하지 않고 {@link ChatUseCase}를 통해서만 흐른다(인바운드 어댑터가 아웃바운드 어댑터를
 * 직접 호출하지 않도록). 이 핸들러는 {@link ChatBroadcastPort} 구현으로서 브로드캐스트만 담당함.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler implements ChatBroadcastPort {

    private final ChatUseCase chatUseCase;
    private final ObjectMapper objectMapper;

    // sessionId → 세션 정보
    private record SessionInfo(
            WebSocketSession session, String userId, String username, boolean isAdmin) {}

    private final Map<String, SessionInfo> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        String userId = (String) session.getAttributes().get("userId");
        String username = (String) session.getAttributes().get("username");
        Boolean isAdmin = (Boolean) session.getAttributes().getOrDefault("isAdmin", false);

        sessions.put(sessionId, new SessionInfo(session, userId, username, isAdmin));
        log.info("WebSocket connected: {} as {} (admin={})", sessionId, username, isAdmin);

        if (isAdmin) {
            // 어드민: 현재 접속 중인 방문자 목록 전송
            sendRoomList(session);
        } else {
            chatUseCase.markAdminMessagesRead(userId);
            // 방문자: 자신의 방 히스토리 전송
            List<ChatMessage> history = chatUseCase.getRecentMessagesByRoom(userId, 50);
            List<Map<String, Object>> historyList =
                    history.stream().map(this::toMessageMap).toList();
            sendToSession(session, Map.of("type", "history", "messages", historyList));

            // 입장 시스템 메시지 저장 + 디스코드 알림 (application 경유)
            chatUseCase.recordSystemEvent(userId, username + "님이 입장했습니다");

            // 어드민에게 새 방문자 알림
            broadcastToAdmins(
                    Map.of("type", "room_joined", "userId", userId, "username", username));
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void handleTextMessage(
            @NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        String sessionId = session.getId();
        SessionInfo info = sessions.get(sessionId);
        if (info == null) return;

        Map<String, String> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = payload.get("type");
        String content = payload.get("content");
        if (!"message".equals(type) || content == null || content.isBlank()) return;

        if (!info.isAdmin()) {
            // 방문자 → 저장 + 브로드캐스트 + 디스코드 알림 (application 이 오케스트레이션)
            chatUseCase.saveAndBroadcast(
                    sessionId,
                    info.username(),
                    content.trim(),
                    ChatMessage.MessageType.TEXT,
                    info.userId(),
                    false);
        } else {
            // 어드민 → toUserId 지정 방문자에게 전송 (자기 자신에게는 불가)
            String toUserId = payload.get("toUserId");
            if (toUserId == null || toUserId.isBlank()) return;
            if (toUserId.equals(info.userId())) return;

            // 웹 어드민 답장 → 저장 + 브로드캐스트 + 디스코드 로깅 (application 경유)
            chatUseCase.saveAndBroadcast(
                    sessionId,
                    info.username(),
                    content.trim(),
                    ChatMessage.MessageType.TEXT,
                    toUserId,
                    true);
        }
    }

    @Override
    public void afterConnectionClosed(
            @NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        SessionInfo info = sessions.remove(session.getId());
        if (info == null) return;

        log.info("WebSocket disconnected: {} ({})", session.getId(), info.username());

        if (!info.isAdmin()) {
            // 퇴장 시스템 메시지 저장 + 디스코드 알림 (application 경유)
            chatUseCase.recordSystemEvent(info.userId(), info.username() + "님이 퇴장했습니다");
            broadcastToAdmins(
                    Map.of(
                            "type",
                            "room_left",
                            "userId",
                            info.userId(),
                            "username",
                            info.username()));
        }
    }

    @Override
    public void handleTransportError(
            @NonNull WebSocketSession session, @NonNull Throwable exception) throws Exception {
        log.error("WebSocket error for session {}: {}", session.getId(), exception.getMessage());
        session.close(CloseStatus.SERVER_ERROR);
    }

    // ChatBroadcastPort 구현

    @Override
    public void broadcast(ChatMessage message) {
        Map<String, Object> payload = toMessageMap(message);
        broadcastToAdmins(payload);
        if (message.getRoomId() != null) {
            broadcastToUserSessions(message.getRoomId(), payload);
            // 관리자 답장이 온라인 방문자에게 전달되면 읽음 처리(웹·디스코드 답장 공통)
            if (message.isFromAdmin() && hasActiveUserSession(message.getRoomId())) {
                chatUseCase.markAdminMessagesRead(message.getRoomId());
            }
        }
    }

    // 내부 보조 메서드

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

    private boolean hasActiveUserSession(String userId) {
        return sessions.values().stream()
                .anyMatch(i -> !i.isAdmin() && userId.equals(i.userId()) && i.session().isOpen());
    }

    private void sendRoomList(WebSocketSession session) {
        List<Map<String, Object>> rooms =
                sessions.values().stream()
                        .filter(i -> !i.isAdmin())
                        .map(
                                i -> {
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
        map.put(
                "timestamp",
                msg.getTimestamp() != null
                        ? msg.getTimestamp().toString()
                        : LocalDateTime.now().toString());
        return map;
    }
}
