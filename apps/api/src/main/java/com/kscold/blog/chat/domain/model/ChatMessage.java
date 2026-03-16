package com.kscold.blog.chat.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    private String sessionId;

    @Indexed
    private String roomId;       // 방문자의 userId (1:1 대화방 식별자)

    private String username;     // 발신자 이름

    private String content;

    private MessageType type;

    private boolean fromAdmin;   // 어드민(블로그 주인) 발신 여부

    private LocalDateTime timestamp;

    public enum MessageType {
        TEXT, SYSTEM
    }
}
