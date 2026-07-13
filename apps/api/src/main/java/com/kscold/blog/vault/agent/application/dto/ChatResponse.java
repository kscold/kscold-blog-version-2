package com.kscold.blog.vault.agent.application.dto;

import java.util.List;

public record ChatResponse(
        String sessionId, String answer, List<AgentStage> stages, List<SourceNote> sources) {}
