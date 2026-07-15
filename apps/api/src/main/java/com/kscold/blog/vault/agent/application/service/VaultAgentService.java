package com.kscold.blog.vault.agent.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.application.dto.command.ChatCommand;
import com.kscold.blog.vault.agent.application.dto.response.AgentContentScopeResponse;
import com.kscold.blog.vault.agent.application.dto.response.AgentStage;
import com.kscold.blog.vault.agent.application.dto.response.ChatHistoryMessage;
import com.kscold.blog.vault.agent.application.dto.response.ChatHistoryResponse;
import com.kscold.blog.vault.agent.application.dto.response.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.response.ReindexResponse;
import com.kscold.blog.vault.agent.application.dto.response.SourceNote;
import com.kscold.blog.vault.agent.application.port.in.VaultAgentUseCase;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentChatMessage;
import com.kscold.blog.vault.agent.domain.model.AgentChatResult;
import com.kscold.blog.vault.agent.domain.model.AgentChatStage;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.domain.model.AgentSource;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentChatHistoryRepository;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentClientPort;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VaultAgentService implements VaultAgentUseCase {

    private static final int HISTORY_LIMIT = 80;

    private final VaultAgentClientPort vaultAgentClientPort;
    private final VaultAgentChatHistoryRepository chatHistoryRepository;
    private final VaultAgentAccessScopeResolver accessScopeResolver;

    @Override
    public ReindexResponse reindexAll() {
        try {
            var response = vaultAgentClientPort.reindex(false);
            return new ReindexResponse(
                    response.totalNotes(), response.indexedNotes(), response.skippedNotes());
        } catch (AgentClientUnavailableException exception) {
            throw agentUnavailable(exception);
        }
    }

    @Override
    public ChatResponse chat(
            ChatCommand request, @Nullable String userId, String clientIdentifier) {
        String sessionId = normalizeSessionId(request.getSessionId());
        String scopeKey = scopeKey(userId, clientIdentifier, sessionId);
        AgentContentAccessScope contentAccessScope = accessScopeResolver.resolve(userId);
        try {
            AgentChatResult result =
                    vaultAgentClientPort.chat(
                            request.getMessage(),
                            request.getActiveFolderName(),
                            contentAccessScope);
            saveUserMessage(scopeKey, sessionId, userId, clientIdentifier, request.getMessage());
            saveAssistantMessage(scopeKey, sessionId, userId, clientIdentifier, result);
            return toChatResponse(sessionId, result);
        } catch (AgentClientUnavailableException exception) {
            throw agentUnavailable(exception);
        }
    }

    @Override
    public void stream(
            ChatCommand request,
            @Nullable String userId,
            String clientIdentifier,
            Consumer<AgentStreamEvent> eventConsumer) {
        String sessionId = normalizeSessionId(request.getSessionId());
        String scopeKey = scopeKey(userId, clientIdentifier, sessionId);
        AgentContentAccessScope contentAccessScope = accessScopeResolver.resolve(userId);
        List<AgentChatStage> stages = new ArrayList<>();
        StringBuilder answerBuilder = new StringBuilder();
        AtomicReference<AgentChatResult> completedResult = new AtomicReference<>();

        saveUserMessage(scopeKey, sessionId, userId, clientIdentifier, request.getMessage());
        try {
            vaultAgentClientPort.streamChat(
                    request.getMessage(),
                    request.getActiveFolderName(),
                    contentAccessScope,
                    event -> {
                        if (event.type() == AgentStreamEvent.Type.STAGE && event.stage() != null) {
                            stages.add(event.stage());
                            eventConsumer.accept(event);
                            return;
                        }
                        if (event.type() == AgentStreamEvent.Type.DELTA && event.delta() != null) {
                            answerBuilder.append(event.delta());
                            eventConsumer.accept(event);
                            return;
                        }
                        if (event.type() == AgentStreamEvent.Type.COMPLETED
                                && event.result() != null) {
                            completedResult.set(event.result());
                        }
                    });

            AgentChatResult rawResult = completedResult.get();
            if (rawResult == null) {
                throw new AgentClientUnavailableException("Vault Agent 응답이 완료되지 않았습니다.", null);
            }
            String answer =
                    rawResult.answer().isBlank() ? answerBuilder.toString() : rawResult.answer();
            AgentChatResult result =
                    new AgentChatResult(answer, stages, rawResult.sources(), rawResult.followUps());
            saveAssistantMessage(scopeKey, sessionId, userId, clientIdentifier, result);
            eventConsumer.accept(AgentStreamEvent.completed(result));
        } catch (AgentClientUnavailableException exception) {
            throw agentUnavailable(exception);
        }
    }

    @Override
    public ChatHistoryResponse history(
            @Nullable String requestedSessionId, @Nullable String userId, String clientIdentifier) {
        String sessionId = normalizeSessionId(requestedSessionId);
        String scopeKey = scopeKey(userId, clientIdentifier, sessionId);
        List<ChatHistoryMessage> messages =
                chatHistoryRepository.findByScopeKey(scopeKey, HISTORY_LIMIT).stream()
                        .map(this::toHistoryMessage)
                        .toList();
        return new ChatHistoryResponse(sessionId, messages);
    }

    @Override
    public AgentContentScopeResponse contentScope(@Nullable String userId) {
        AgentContentAccessScope scope = accessScopeResolver.resolve(userId);
        if (scope.fullContentAccess()) {
            return new AgentContentScopeResponse(
                    "열람 가능한 모든 기록을 참고합니다", "공개 글과 권한이 부여된 비공개 글을 함께 참고합니다.");
        }
        if (scope.hasAdditionalAccess()) {
            return new AgentContentScopeResponse("내 열람 권한을 반영해 답합니다", "공개 글과 승인된 글을 함께 참고합니다.");
        }
        return new AgentContentScopeResponse(
                "공개된 기록을 바탕으로 답합니다", "블로그 글, 피드, Vault 노트와 소개 페이지에서 답의 근거를 찾습니다.");
    }

    private ChatResponse toChatResponse(String sessionId, AgentChatResult result) {
        return new ChatResponse(
                sessionId,
                result.answer(),
                result.stages().stream().map(this::toStage).toList(),
                result.sources().stream().map(this::toSource).toList(),
                result.followUps());
    }

    private ChatHistoryMessage toHistoryMessage(AgentChatMessage message) {
        return new ChatHistoryMessage(
                message.id(),
                message.role(),
                message.content(),
                message.stages().stream().map(this::toStage).toList(),
                message.sources().stream().map(this::toSource).toList(),
                message.createdAt());
    }

    private AgentStage toStage(AgentChatStage stage) {
        return new AgentStage(stage.name(), stage.detail());
    }

    private SourceNote toSource(AgentSource source) {
        return new SourceNote(
                source.id(),
                source.title(),
                source.slug(),
                source.score(),
                source.type(),
                source.path());
    }

    private void saveUserMessage(
            String scopeKey,
            String sessionId,
            @Nullable String userId,
            String clientIdentifier,
            String content) {
        chatHistoryRepository.save(
                new AgentChatMessage(
                        "",
                        scopeKey,
                        sessionId,
                        userId,
                        clientIdentifier,
                        "user",
                        content,
                        List.of(),
                        List.of(),
                        Instant.now()));
    }

    private void saveAssistantMessage(
            String scopeKey,
            String sessionId,
            @Nullable String userId,
            String clientIdentifier,
            AgentChatResult result) {
        chatHistoryRepository.save(
                new AgentChatMessage(
                        "",
                        scopeKey,
                        sessionId,
                        userId,
                        clientIdentifier,
                        "assistant",
                        result.answer(),
                        result.stages(),
                        result.sources(),
                        Instant.now()));
    }

    private String normalizeSessionId(@Nullable String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String sanitizedSessionId = sessionId.replaceAll("[^a-zA-Z0-9._:-]", "");
        if (sanitizedSessionId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        return sanitizedSessionId.substring(0, Math.min(80, sanitizedSessionId.length()));
    }

    private String scopeKey(@Nullable String userId, String clientIdentifier, String sessionId) {
        if (userId != null && !userId.isBlank()) {
            return "user:%s:%s".formatted(userId, sessionId);
        }
        return "guest:%s:%s".formatted(clientIdentifier, sessionId);
    }

    private BusinessException agentUnavailable(AgentClientUnavailableException exception) {
        return new BusinessException(ErrorCode.EXTERNAL_API_ERROR, exception.getMessage());
    }
}
