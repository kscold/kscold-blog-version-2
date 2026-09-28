package com.kscold.blog.vault.agent.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.exception.RateLimitExceededException;
import com.kscold.blog.vault.agent.application.dto.command.PageChatCommand;
import com.kscold.blog.vault.agent.application.port.in.PageAgentUseCase;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/** 로그인 상태를 질의 계약에 포함하지 않는 일회성 페이지 Agent 경계다. */
@RestController
@RequestMapping("/vault/agent/page")
public class PageAgentController {

    private final PageAgentUseCase useCase;
    private final PageAgentClientIdentifierResolver identifiers;
    private final ObjectMapper mapper;
    private final Executor executor;

    public PageAgentController(
            PageAgentUseCase useCase,
            PageAgentClientIdentifierResolver identifiers,
            ObjectMapper mapper,
            @Qualifier("vaultAgentSseExecutor") Executor executor) {
        this.useCase = useCase;
        this.identifiers = identifiers;
        this.mapper = mapper;
        this.executor = executor;
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> stream(
            @Valid @RequestBody PageChatCommand command, HttpServletRequest request) {
        PageAgentStreamSession session = useCase.reserve(identifiers.resolve(request));
        SseEmitter emitter = new SseEmitter(65000L);
        emitter.onCompletion(session::close);
        emitter.onTimeout(session::close);
        emitter.onError(ignored -> session.close());
        PageAgentSseWriter writer = new PageAgentSseWriter(emitter, mapper);
        try {
            executor.execute(() -> run(command, session, emitter, writer));
        } catch (RejectedExecutionException exception) {
            session.close();
            throw new RateLimitExceededException("페이지 Agent가 처리 중입니다. 잠시 후 다시 시도해주세요.");
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-store, no-transform")
                .header("X-Accel-Buffering", "no")
                .header("X-Robots-Tag", "noindex, nofollow, noarchive")
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(emitter);
    }

    private void run(
            PageChatCommand command,
            PageAgentStreamSession session,
            SseEmitter emitter,
            PageAgentSseWriter writer) {
        try {
            useCase.stream(command, session, writer::sendEvent);
        } catch (Exception exception) {
            if (session.isActive()) {
                writer.sendError();
            }
        } finally {
            session.close();
            emitter.complete();
        }
    }
}
