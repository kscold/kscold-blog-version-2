package com.kscold.blog.vault.agent.domain.port.out;

import com.kscold.blog.vault.agent.domain.model.AgentChatMessage;
import java.util.List;

public interface VaultAgentChatHistoryRepository {

    void save(AgentChatMessage message);

    /** 범위에서 최신 메시지를 선택한 뒤 시간 오름차순으로 반환한다. */
    List<AgentChatMessage> findLatestByScopeKey(String scopeKey, int limit);
}
