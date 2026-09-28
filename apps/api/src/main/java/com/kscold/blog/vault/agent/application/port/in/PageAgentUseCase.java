package com.kscold.blog.vault.agent.application.port.in;

import com.kscold.blog.vault.agent.application.dto.command.PageChatCommand;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import java.util.function.Consumer;

public interface PageAgentUseCase {
    PageAgentStreamSession reserve(String clientIdentifier);

    void stream(
            PageChatCommand command,
            PageAgentStreamSession session,
            Consumer<AgentStreamEvent> receiver);
}
