package com.kscold.blog.vault.agent.application.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatHistoryResponse {

    private String sessionId;
    private List<ChatHistoryMessage> messages;
}
