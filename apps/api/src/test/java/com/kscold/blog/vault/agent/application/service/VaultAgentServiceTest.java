package com.kscold.blog.vault.agent.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentChatHistoryRepository;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentClientPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VaultAgentServiceTest {

    @Mock private VaultAgentClientPort vaultAgentClientPort;

    @Mock private VaultAgentChatHistoryRepository chatHistoryRepository;

    @Mock private VaultAgentAccessScopeResolver accessScopeResolver;

    @InjectMocks private VaultAgentService vaultAgentService;

    @Test
    @DisplayName("시나리오: Vault Agent 내부 오류 메시지는 API 예외로 노출하지 않는다")
    void chatSanitizesAgentError() {
        String sensitiveMessage = "grpc-internal-sensitive-value";
        AgentContentAccessScope scope = AgentContentAccessScope.publicOnly();
        when(accessScopeResolver.resolve(null)).thenReturn(scope);
        when(vaultAgentClientPort.chat(eq("질문"), eq(null), eq(scope)))
                .thenThrow(new AgentClientUnavailableException(sensitiveMessage, null));

        assertThatThrownBy(
                        () ->
                                vaultAgentService.chat(
                                        ChatCommand.builder().message("질문").build(),
                                        null,
                                        "anonymous-client"))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.EXTERNAL_API_ERROR.getMessage())
                .satisfies(
                        exception ->
                                assertThat(exception.getMessage()).doesNotContain(sensitiveMessage))
                .hasNoCause();
    }
}
