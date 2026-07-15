package com.kscold.blog.vault.agent.application.port.in;

import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.application.dto.response.AgentContentScopeResponse;
import com.kscold.blog.vault.agent.application.dto.response.ChatHistoryResponse;
import com.kscold.blog.vault.agent.application.dto.response.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.response.ReindexResponse;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import java.util.function.Consumer;
import org.springframework.lang.Nullable;

public interface VaultAgentUseCase {

    ChatResponse chat(ChatCommand request, @Nullable String userId, String clientIdentifier);

    void stream(
            ChatCommand request,
            @Nullable String userId,
            String clientIdentifier,
            Consumer<AgentStreamEvent> eventConsumer);

    ChatHistoryResponse history(
            @Nullable String requestedSessionId, @Nullable String userId, String clientIdentifier);

    AgentContentScopeResponse contentScope(@Nullable String userId);

    ReindexResponse reindexAll();
}
