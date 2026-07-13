package com.kscold.blog.vault.agent.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.application.dto.AgentStage;
import com.kscold.blog.vault.agent.application.dto.ChatHistoryMessage;
import com.kscold.blog.vault.agent.application.dto.ChatHistoryResponse;
import com.kscold.blog.vault.agent.application.dto.ChatResponse;
import com.kscold.blog.vault.agent.application.dto.ReindexResponse;
import com.kscold.blog.vault.agent.application.dto.SourceNote;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.grpc.ChatRequest;
import com.kscold.blog.vault.agent.grpc.ReindexRequest;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PreDestroy;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class VaultAgentService {

    private static final String CHAT_COLLECTION = "vault_agent_chat_messages";
    private static final int HISTORY_LIMIT = 80;

    private final VaultAgentProperties properties;
    private final MongoTemplate mongoTemplate;
    private final ManagedChannel channel;
    private final VaultAgentServiceGrpc.VaultAgentServiceBlockingStub blockingStub;

    public VaultAgentService(VaultAgentProperties properties, MongoTemplate mongoTemplate) {
        this.properties = properties;
        this.mongoTemplate = mongoTemplate;
        this.channel =
                io.grpc.ManagedChannelBuilder.forAddress(properties.getHost(), properties.getPort())
                        .usePlaintext()
                        .build();
        this.blockingStub = VaultAgentServiceGrpc.newBlockingStub(channel);
    }

    public ReindexResponse reindexAll() {
        try {
            var response = stub().reindex(ReindexRequest.newBuilder().setForce(false).build());
            return new ReindexResponse(
                    response.getTotalNotes(),
                    response.getIndexedNotes(),
                    response.getSkippedNotes());
        } catch (StatusRuntimeException exception) {
            throw agentUnavailable(exception);
        }
    }

    public ChatResponse chat(
            com.kscold.blog.vault.agent.application.dto.ChatRequest request,
            String userId,
            String clientIdentifier) {
        String sessionId = normalizeSessionId(request.sessionId());
        String scopeKey = scopeKey(userId, clientIdentifier, sessionId);
        try {
            var response =
                    stub().chat(
                                    ChatRequest.newBuilder()
                                            .setMessage(request.message())
                                            .setActiveFolderName(
                                                    request.activeFolderName() == null
                                                            ? ""
                                                            : request.activeFolderName())
                                            .build());

            List<AgentStage> stages =
                    response.getStagesList().stream()
                            .map(stage -> new AgentStage(stage.getName(), stage.getDetail()))
                            .toList();
            List<SourceNote> sources =
                    response.getSourcesList().stream()
                            .map(
                                    source ->
                                            new SourceNote(
                                                    source.getId(),
                                                    source.getTitle(),
                                                    source.getSlug(),
                                                    source.getScore(),
                                                    source.getType(),
                                                    source.getPath()))
                            .toList();
            saveMessage(
                    scopeKey,
                    sessionId,
                    userId,
                    clientIdentifier,
                    "user",
                    request.message(),
                    List.of(),
                    List.of());
            saveMessage(
                    scopeKey,
                    sessionId,
                    userId,
                    clientIdentifier,
                    "assistant",
                    response.getAnswer(),
                    stages,
                    sources);

            return new ChatResponse(sessionId, response.getAnswer(), stages, sources);
        } catch (StatusRuntimeException exception) {
            throw agentUnavailable(exception);
        }
    }

    public ChatHistoryResponse history(
            String requestedSessionId, String userId, String clientIdentifier) {
        String sessionId = normalizeSessionId(requestedSessionId);
        String scopeKey = scopeKey(userId, clientIdentifier, sessionId);
        Query query =
                Query.query(Criteria.where("scopeKey").is(scopeKey))
                        .with(Sort.by(Sort.Direction.ASC, "createdAt"))
                        .limit(HISTORY_LIMIT);
        List<ChatHistoryMessage> messages =
                mongoTemplate.find(query, Document.class, CHAT_COLLECTION).stream()
                        .map(this::toHistoryMessage)
                        .toList();
        return new ChatHistoryResponse(sessionId, messages);
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    private VaultAgentServiceGrpc.VaultAgentServiceBlockingStub stub() {
        return blockingStub.withDeadlineAfter(
                properties.getDeadlineMillis(), TimeUnit.MILLISECONDS);
    }

    private String normalizeSessionId(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        String sanitizedSessionId = sessionId.replaceAll("[^a-zA-Z0-9._:-]", "");
        if (sanitizedSessionId.isBlank()) {
            return UUID.randomUUID().toString();
        }
        return sanitizedSessionId.substring(0, Math.min(80, sanitizedSessionId.length()));
    }

    private String scopeKey(String userId, String clientIdentifier, String sessionId) {
        if (userId != null && !userId.isBlank()) {
            return "user:%s:%s".formatted(userId, sessionId);
        }
        return "guest:%s:%s".formatted(clientIdentifier, sessionId);
    }

    private void saveMessage(
            String scopeKey,
            String sessionId,
            String userId,
            String clientIdentifier,
            String role,
            String content,
            List<AgentStage> stages,
            List<SourceNote> sources) {
        mongoTemplate.insert(
                new Document()
                        .append("scopeKey", scopeKey)
                        .append("sessionId", sessionId)
                        .append("userId", userId)
                        .append("clientIdentifier", clientIdentifier)
                        .append("role", role)
                        .append("content", content)
                        .append(
                                "stages",
                                stages.stream()
                                        .map(
                                                stage ->
                                                        new Document("name", stage.name())
                                                                .append("detail", stage.detail()))
                                        .toList())
                        .append(
                                "sources",
                                sources.stream()
                                        .map(
                                                source ->
                                                        new Document("id", source.id())
                                                                .append("title", source.title())
                                                                .append("slug", source.slug())
                                                                .append("score", source.score())
                                                                .append("type", source.type())
                                                                .append("path", source.path()))
                                        .toList())
                        .append("createdAt", Date.from(Instant.now())),
                CHAT_COLLECTION);
    }

    @SuppressWarnings("unchecked")
    private ChatHistoryMessage toHistoryMessage(Document document) {
        List<AgentStage> stages =
                ((List<Document>) document.getOrDefault("stages", List.of()))
                        .stream()
                                .map(
                                        stage ->
                                                new AgentStage(
                                                        toStringValue(stage.get("name")),
                                                        toStringValue(stage.get("detail"))))
                                .toList();
        List<SourceNote> sources =
                ((List<Document>) document.getOrDefault("sources", List.of()))
                        .stream()
                                .map(
                                        source ->
                                                new SourceNote(
                                                        toStringValue(source.get("id")),
                                                        toStringValue(source.get("title")),
                                                        toStringValue(source.get("slug")),
                                                        toDouble(source.get("score")),
                                                        toStringValue(source.get("type")),
                                                        toStringValue(source.get("path"))))
                                .toList();
        return new ChatHistoryMessage(
                toStringValue(document.get("_id")),
                toStringValue(document.get("role")),
                toStringValue(document.get("content")),
                stages,
                sources,
                toInstant(document.get("createdAt")));
    }

    private String toStringValue(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof ObjectId objectId) {
            return objectId.toHexString();
        }
        return String.valueOf(value);
    }

    private double toDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        return 0;
    }

    private Instant toInstant(Object value) {
        if (value instanceof Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        return null;
    }

    private BusinessException agentUnavailable(StatusRuntimeException exception) {
        log.warn(
                "Vault Agent gRPC request failed target={}:{} status={}",
                properties.getHost(),
                properties.getPort(),
                exception.getStatus(),
                exception);
        return new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "Vault Agent 서버 응답을 받을 수 없습니다.");
    }
}
