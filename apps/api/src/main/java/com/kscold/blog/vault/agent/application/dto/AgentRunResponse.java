package com.kscold.blog.vault.agent.application.dto;

import java.time.Instant;
import java.util.List;

public record AgentRunResponse(
        String id,
        String question,
        String answerPreview,
        int sourceCount,
        List<SourceNote> sources,
        Instant createdAt) {}
