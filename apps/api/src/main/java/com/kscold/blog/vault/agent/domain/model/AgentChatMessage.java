package com.kscold.blog.vault.agent.domain.model;

import java.time.Instant;
import java.util.List;

public record AgentChatMessage(
        String id,
        String scopeKey,
        String sessionId,
        String userId,
        String clientIdentifier,
        String role,
        String content,
        List<AgentChatStage> stages,
        List<AgentSource> sources,
        Instant createdAt) {

    public AgentChatMessage {
        stages = List.copyOf(stages == null ? List.of() : stages);
        sources = List.copyOf(sources == null ? List.of() : sources);
    }
}
