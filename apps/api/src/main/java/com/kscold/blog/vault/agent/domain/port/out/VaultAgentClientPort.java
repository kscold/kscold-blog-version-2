package com.kscold.blog.vault.agent.domain.port.out;

import com.kscold.blog.vault.agent.domain.model.AgentChatResult;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.domain.model.AgentReindexResult;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import java.util.function.Consumer;

public interface VaultAgentClientPort {

    AgentChatResult chat(
            String message, String activeFolderName, AgentContentAccessScope contentAccessScope);

    void streamChat(
            String message,
            String activeFolderName,
            AgentContentAccessScope contentAccessScope,
            Consumer<AgentStreamEvent> eventConsumer);

    AgentReindexResult reindex(boolean force);
}
