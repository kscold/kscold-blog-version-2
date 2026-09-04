package com.kscold.blog.vault.agent.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.application.port.in.VaultAgentUseCase;
import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.Executor;
import java.util.function.Consumer;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

class VaultAgentControllerTest {

    @Test
    @DisplayName("시나리오: SSE 처리 오류 로그에는 원본 예외 메시지를 남기지 않는다")
    void streamChatSanitizesLoggedError() {
        String sensitiveMessage = "upstream-sensitive-value";
        VaultAgentUseCase useCase = mock(VaultAgentUseCase.class);
        ClientIdentifierResolver identifierResolver = mock(ClientIdentifierResolver.class);
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(identifierResolver.resolve(request)).thenReturn("anonymous-client");
        doThrow(new IllegalStateException(sensitiveMessage)).when(useCase).stream(
                any(ChatCommand.class), isNull(), anyString(), any(Consumer.class));
        Executor directExecutor = Runnable::run;
        VaultAgentController controller =
                new VaultAgentController(
                        useCase, identifierResolver, new ObjectMapper(), directExecutor);
        Logger logger = (Logger) LoggerFactory.getLogger(VaultAgentController.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);

        try {
            controller.streamChat(null, request, ChatCommand.builder().message("질문").build());

            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .allMatch(message -> !message.contains(sensitiveMessage))
                    .anyMatch(message -> message.contains("IllegalStateException"));
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }
    }
}
