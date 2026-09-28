package com.kscold.blog.vault.agent.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.application.dto.command.PageChatCommand;
import com.kscold.blog.vault.agent.application.port.in.PageAgentUseCase;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentQuery;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentAdmissionPort;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentClientPort;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** 페이지 전용 질의는 사용자 권한·검색 저장소·대화 저장소에 의존하지 않는다. */
@Service
@RequiredArgsConstructor
public class PageAgentApplicationService implements PageAgentUseCase {

    private final PageAgentAdmissionPort admission;
    private final PageAgentClientPort client;

    @Override
    public PageAgentStreamSession reserve(String clientIdentifier) {
        return admission.reserve(clientIdentifier);
    }

    @Override
    public void stream(
            PageChatCommand command,
            PageAgentStreamSession session,
            Consumer<AgentStreamEvent> receiver) {
        if (!session.isActive()) {
            return;
        }
        try {
            client.stream(
                    toQuery(command),
                    session,
                    event -> {
                        if (session.isActive()) {
                            receiver.accept(event);
                        }
                    });
        } catch (AgentClientUnavailableException exception) {
            if (session.isActive()) {
                throw new BusinessException(ErrorCode.EXTERNAL_API_ERROR);
            }
        }
    }

    private PageAgentQuery toQuery(PageChatCommand command) {
        var context = command.pageContext();
        var sections =
                context.sections().stream()
                        .map(
                                section ->
                                        new PageAgentQuery.Section(
                                                section.id(), section.title(), section.content()))
                        .toList();
        var conversation =
                command.conversation().stream()
                        .map(
                                message ->
                                        new PageAgentQuery.ConversationMessage(
                                                message.role(), message.content()))
                        .toList();
        return new PageAgentQuery(
                command.message(),
                new PageAgentQuery.Context(context.title(), context.path(), sections),
                conversation);
    }
}
