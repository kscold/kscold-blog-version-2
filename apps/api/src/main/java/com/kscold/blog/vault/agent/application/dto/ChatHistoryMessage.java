package com.kscold.blog.vault.agent.application.dto;

import java.time.Instant;
import java.util.List;

public record ChatHistoryMessage(
        String id,
        String role,
        String content,
        List<AgentStage> stages,
        List<SourceNote> sources,
        Instant createdAt) {}
