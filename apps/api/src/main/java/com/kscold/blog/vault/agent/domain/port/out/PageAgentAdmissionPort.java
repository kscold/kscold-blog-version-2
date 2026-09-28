package com.kscold.blog.vault.agent.domain.port.out;

import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;

public interface PageAgentAdmissionPort {
    PageAgentStreamSession reserve(String clientIdentifier);
}
