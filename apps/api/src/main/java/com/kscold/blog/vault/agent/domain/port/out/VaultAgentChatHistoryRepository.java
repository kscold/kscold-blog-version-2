package com.kscold.blog.vault.agent.domain.port.out;

import com.kscold.blog.vault.agent.domain.model.AgentChatMessage;
import java.util.List;

public interface VaultAgentChatHistoryRepository {

    void save(AgentChatMessage message);

    List<AgentChatMessage> findByScopeKey(String scopeKey, int limit);
}
