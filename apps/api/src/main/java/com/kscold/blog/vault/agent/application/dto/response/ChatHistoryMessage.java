package com.kscold.blog.vault.agent.application.dto.response;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatHistoryMessage {

    private String id;
    private String role;
    private String content;
    private List<AgentStage> stages;
    private List<SourceNote> sources;
    private Instant createdAt;
}
