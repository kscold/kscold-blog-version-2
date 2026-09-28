package com.kscold.blog.vault.agent.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.application.dto.command.PageChatCommand;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentQuery;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentAdmissionPort;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentClientPort;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PageAgentApplicationServiceTest {
    private final PageAgentAdmissionPort admission = mock(PageAgentAdmissionPort.class);
    private final PageAgentClientPort client = mock(PageAgentClientPort.class);
    private final PageAgentApplicationService service =
            new PageAgentApplicationService(admission, client);

    @Test
    void sendsOnlySubmittedPageDataAndEmitsEventsWithoutPersistence() {
        PageAgentStreamSession session = new PageAgentStreamSession(() -> {});
        List<AgentStreamEvent> events = new ArrayList<>();
        doAnswer(
                invocation -> {
                    Consumer<AgentStreamEvent> receiver = invocation.getArgument(2);
                    receiver.accept(AgentStreamEvent.delta("페이지 설명"));
                    return null;
                })
                .when(client)
                .stream(any(), eq(session), any());
        service.stream(command(), session, events::add);
        ArgumentCaptor<PageAgentQuery> query = ArgumentCaptor.forClass(PageAgentQuery.class);
        verify(client).stream(query.capture(), eq(session), any());
        assertThat(query.getValue().context().sections().getFirst().content()).isEqualTo("팀 협업 자료");
        assertThat(events).extracting(AgentStreamEvent::delta).containsExactly("페이지 설명");
        verifyNoInteractions(admission);
    }

    @Test
    void closedSessionDoesNotInvokeProvider() {
        PageAgentStreamSession session = new PageAgentStreamSession(() -> {});
        session.close();
        service.stream(command(), session, ignored -> {});
        verifyNoInteractions(client);
    }

    @Test
    void hidesProviderErrorsAndIgnoresCancellationErrors() {
        PageAgentStreamSession session = new PageAgentStreamSession(() -> {});
        doThrow(new AgentClientUnavailableException("sensitive-provider-error", null))
                .when(client)
                .stream(any(), eq(session), any());
        assertThatThrownBy(() -> service.stream(command(), session, ignored -> {}))
                .isInstanceOf(BusinessException.class)
                .hasMessage(ErrorCode.EXTERNAL_API_ERROR.getMessage())
                .hasNoCause();
        session.close();
        service.stream(command(), session, ignored -> {});
    }

    private PageChatCommand command() {
        return new PageChatCommand(
                "역할을 알려줘",
                new PageChatCommand.PageContext(
                        "작업 소개",
                        "/work-sample",
                        List.of(new PageChatCommand.Section("one", "프로젝트", "팀 협업 자료"))),
                List.of());
    }
}
