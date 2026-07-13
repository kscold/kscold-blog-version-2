package com.kscold.blog.vault.agent.application.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatResponse {

    private String sessionId;
    private String answer;
    private List<AgentStage> stages;
    private List<SourceNote> sources;
    private List<String> followUps;
}
