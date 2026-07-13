package com.kscold.blog.chat.adapter.in.web.dto.response;

import com.kscold.blog.chat.domain.model.ChatMessage;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private String id;
    private String sessionId;
    private String roomId;
    private String username;
    private String content;
    private ChatMessage.MessageType type;
    private boolean fromAdmin;
    private LocalDateTime timestamp;
    private LocalDateTime visitorReadAt;
    private LocalDateTime reminderSentAt;

    public static ChatMessageResponse from(ChatMessage message) {
        return ChatMessageResponse.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .roomId(message.getRoomId())
                .username(message.getUsername())
                .content(message.getContent())
                .type(message.getType())
                .fromAdmin(message.isFromAdmin())
                .timestamp(message.getTimestamp())
                .visitorReadAt(message.getVisitorReadAt())
                .reminderSentAt(message.getReminderSentAt())
                .build();
    }

    public static List<ChatMessageResponse> from(List<ChatMessage> messages) {
        return messages.stream().map(ChatMessageResponse::from).toList();
    }
}
