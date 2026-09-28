package com.kscold.blog.vault.agent.domain.port.out;

import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentQuery;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import java.util.function.Consumer;

public interface PageAgentClientPort {
    void stream(
            PageAgentQuery query,
            PageAgentStreamSession session,
            Consumer<AgentStreamEvent> receiver);
}
