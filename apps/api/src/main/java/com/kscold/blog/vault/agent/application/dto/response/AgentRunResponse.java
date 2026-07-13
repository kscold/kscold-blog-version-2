package com.kscold.blog.vault.agent.application.dto.response;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AgentRunResponse {

    private String id;
    private String question;
    private String answerPreview;
    private int sourceCount;
    private List<SourceNote> sources;
    private Instant createdAt;
}
