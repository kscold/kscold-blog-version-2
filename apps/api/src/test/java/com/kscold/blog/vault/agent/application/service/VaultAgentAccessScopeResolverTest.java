package com.kscold.blog.vault.agent.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import org.junit.jupiter.api.Test;

class VaultAgentAccessScopeResolverTest {

    @Test
    void Spring_익명_principal은_공개_콘텐츠만_조회한다() {
        AccessRequestUseCase accessRequestUseCase = mock(AccessRequestUseCase.class);
        UserQueryPort userQueryPort = mock(UserQueryPort.class);
        VaultAgentAccessScopeResolver resolver =
                new VaultAgentAccessScopeResolver(accessRequestUseCase, userQueryPort);

        AgentContentAccessScope scope = resolver.resolve("anonymousUser");

        assertThat(scope.fullContentAccess()).isFalse();
        assertThat(scope.hasAdditionalAccess()).isFalse();
        verifyNoInteractions(accessRequestUseCase, userQueryPort);
    }
}
