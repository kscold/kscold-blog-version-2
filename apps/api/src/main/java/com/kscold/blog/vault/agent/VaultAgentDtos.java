package com.kscold.blog.vault.agent;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public final class VaultAgentDtos {

    private VaultAgentDtos() {
    }

    public record ChatRequest(
            @NotBlank(message = "질문을 입력해주세요.")
            @Size(max = 1200, message = "질문은 1200자 이하로 입력해주세요.")
            String message,

            String activeFolderName
    ) {
    }

    public record ChatResponse(
            String answer,
            List<AgentStage> stages,
            List<SourceNote> sources
    ) {
    }

    public record AgentStage(
            String name,
            String detail
    ) {
    }

    public record SourceNote(
            String id,
            String title,
            String slug,
            double score
    ) {
    }

    public record ReindexResponse(
            int totalNotes,
            int indexedNotes,
            int skippedNotes
    ) {
    }

    public record AgentRunResponse(
            String id,
            String question,
            String answerPreview,
            int sourceCount,
            List<SourceNote> sources,
            Instant createdAt
    ) {
    }
}
