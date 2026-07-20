package com.kscold.blog.vault.agent.adapter.in.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.application.dto.response.AgentContentScopeResponse;
import com.kscold.blog.vault.agent.application.dto.response.AgentStage;
import com.kscold.blog.vault.agent.application.dto.response.ChatHistoryResponse;
import com.kscold.blog.vault.agent.application.dto.response.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.response.ReindexResponse;
import com.kscold.blog.vault.agent.application.port.in.VaultAgentUseCase;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RestController
@RequestMapping("/vault/agent")
public class VaultAgentController {

    private static final long STREAM_TIMEOUT_MILLIS = 120_000L;

    private final VaultAgentUseCase vaultAgentUseCase;
    private final ClientIdentifierResolver clientIdentifierResolver;
    private final ObjectMapper objectMapper;
    private final Executor vaultAgentSseExecutor;

    public VaultAgentController(
            VaultAgentUseCase vaultAgentUseCase,
            ClientIdentifierResolver clientIdentifierResolver,
            ObjectMapper objectMapper,
            @Qualifier("vaultAgentSseExecutor") Executor vaultAgentSseExecutor) {
        this.vaultAgentUseCase = vaultAgentUseCase;
        this.clientIdentifierResolver = clientIdentifierResolver;
        this.objectMapper = objectMapper;
        this.vaultAgentSseExecutor = vaultAgentSseExecutor;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @Valid @RequestBody ChatCommand request) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(
                ApiResponse.success(vaultAgentUseCase.chat(request, userId, clientIdentifier)));
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> streamChat(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @Valid @RequestBody ChatCommand request) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MILLIS);
        emitter.onTimeout(emitter::complete);

        vaultAgentSseExecutor.execute(
                () -> {
                    try {
                        vaultAgentUseCase.stream(
                                request,
                                userId,
                                clientIdentifier,
                                event -> sendAgentEvent(emitter, event));
                        emitter.complete();
                    } catch (Exception exception) {
                        log.warn("Vault Agent SSE 응답 중 오류가 발생했습니다.", exception);
                        sendError(emitter, exception.getMessage());
                        emitter.completeWithError(exception);
                    }
                });
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-transform")
                .header("X-Accel-Buffering", "no")
                .contentType(MediaType.TEXT_EVENT_STREAM)
                .body(emitter);
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<ChatHistoryResponse>> history(
            @AuthenticationPrincipal String userId,
            HttpServletRequest httpRequest,
            @RequestParam(required = false) String sessionId) {
        String clientIdentifier = clientIdentifierResolver.resolve(httpRequest);
        return ResponseEntity.ok(
                ApiResponse.success(
                        vaultAgentUseCase.history(sessionId, userId, clientIdentifier)));
    }

    @GetMapping("/content-scope")
    public ResponseEntity<ApiResponse<AgentContentScopeResponse>> contentScope(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentUseCase.contentScope(userId)));
    }

    @PostMapping("/reindex")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReindexResponse>> reindex() {
        return ResponseEntity.ok(ApiResponse.success(vaultAgentUseCase.reindexAll()));
    }

    private void sendAgentEvent(SseEmitter emitter, AgentStreamEvent event) {
        if (event.type() == AgentStreamEvent.Type.STAGE && event.stage() != null) {
            send(emitter, "stage", new AgentStage(event.stage().name(), event.stage().detail()));
            return;
        }
        if (event.type() == AgentStreamEvent.Type.DELTA) {
            send(emitter, "delta", Map.of("delta", event.delta()));
            return;
        }
        if (event.type() == AgentStreamEvent.Type.COMPLETED && event.result() != null) {
            var result = event.result();
            send(
                    emitter,
                    "complete",
                    new ChatResponse(
                            "",
                            result.answer(),
                            result.stages().stream()
                                    .map(stage -> new AgentStage(stage.name(), stage.detail()))
                                    .toList(),
                            result.sources().stream()
                                    .map(
                                            source ->
                                                    new com.kscold.blog.vault.agent.application.dto
                                                            .response.SourceNote(
                                                            source.id(),
                                                            source.title(),
                                                            source.slug(),
                                                            source.score(),
                                                            source.type(),
                                                            source.path(),
                                                            source.excerpt()))
                                    .toList(),
                            result.followUps()));
        }
    }

    private void sendError(SseEmitter emitter, String message) {
        try {
            send(emitter, "error", Map.of("message", message == null ? "응답을 만들지 못했습니다." : message));
        } catch (RuntimeException ignored) {
            // 연결이 끊긴 경우에는 별도 응답을 보낼 수 없음.
        }
    }

    private void send(SseEmitter emitter, String eventName, Object payload) {
        try {
            emitter.send(
                    SseEmitter.event()
                            .name(eventName)
                            .data(objectMapper.writeValueAsString(payload)));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Vault Agent SSE 응답을 직렬화하지 못했습니다.", exception);
        } catch (IOException exception) {
            throw new IllegalStateException("Vault Agent SSE 연결이 종료되었습니다.", exception);
        }
    }
}
