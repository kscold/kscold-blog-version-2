package com.kscold.blog.vault.agent.domain.model;

import java.util.List;

public record AgentChatResult(
        String answer,
        List<AgentChatStage> stages,
        List<AgentSource> sources,
        List<String> followUps) {

    public AgentChatResult {
        stages = List.copyOf(stages == null ? List.of() : stages);
        sources = List.copyOf(sources == null ? List.of() : sources);
        followUps = List.copyOf(followUps == null ? List.of() : followUps);
    }
}
