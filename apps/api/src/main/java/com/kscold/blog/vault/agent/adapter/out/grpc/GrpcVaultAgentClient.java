package com.kscold.blog.vault.agent.adapter.out.grpc;

import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentChatResult;
import com.kscold.blog.vault.agent.domain.model.AgentChatStage;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.domain.model.AgentReindexResult;
import com.kscold.blog.vault.agent.domain.model.AgentSource;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.port.out.VaultAgentClientPort;
import com.kscold.blog.vault.agent.grpc.ChatCompleted;
import com.kscold.blog.vault.agent.grpc.ChatRequest;
import com.kscold.blog.vault.agent.grpc.ChatStreamEvent;
import com.kscold.blog.vault.agent.grpc.ContentAccessScope;
import com.kscold.blog.vault.agent.grpc.ReindexRequest;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PreDestroy;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class GrpcVaultAgentClient implements VaultAgentClientPort {

    private final VaultAgentProperties properties;
    private final ManagedChannel channel;
    private final VaultAgentServiceGrpc.VaultAgentServiceBlockingStub blockingStub;

    public GrpcVaultAgentClient(VaultAgentProperties properties) {
        this.properties = properties;
        this.channel =
                ManagedChannelBuilder.forAddress(properties.getHost(), properties.getPort())
                        .usePlaintext()
                        .build();
        this.blockingStub = VaultAgentServiceGrpc.newBlockingStub(channel);
    }

    @Override
    public AgentChatResult chat(
            String message, String activeFolderName, AgentContentAccessScope contentAccessScope) {
        try {
            return toResult(stub().chat(toRequest(message, activeFolderName, contentAccessScope)));
        } catch (StatusRuntimeException exception) {
            throw unavailable(exception);
        }
    }

    @Override
    public void streamChat(
            String message,
            String activeFolderName,
            AgentContentAccessScope contentAccessScope,
            Consumer<AgentStreamEvent> eventConsumer) {
        try {
            Iterator<ChatStreamEvent> events =
                    stub().chatStream(toRequest(message, activeFolderName, contentAccessScope));
            while (events.hasNext()) {
                ChatStreamEvent event = events.next();
                switch (event.getEventCase()) {
                    case STAGE ->
                            eventConsumer.accept(AgentStreamEvent.stage(toStage(event.getStage())));
                    case DELTA -> eventConsumer.accept(AgentStreamEvent.delta(event.getDelta()));
                    case COMPLETED ->
                            eventConsumer.accept(
                                    AgentStreamEvent.completed(toCompleted(event.getCompleted())));
                    case EVENT_NOT_SET -> {
                        // 아직 전달할 이벤트가 없는 경우는 건너뜁니다.
                    }
                }
            }
        } catch (StatusRuntimeException exception) {
            throw unavailable(exception);
        }
    }

    @Override
    public AgentReindexResult reindex(boolean force) {
        try {
            var response = stub().reindex(ReindexRequest.newBuilder().setForce(force).build());
            return new AgentReindexResult(
                    response.getTotalNotes(),
                    response.getIndexedNotes(),
                    response.getSkippedNotes());
        } catch (StatusRuntimeException exception) {
            throw unavailable(exception);
        }
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    private VaultAgentServiceGrpc.VaultAgentServiceBlockingStub stub() {
        return blockingStub.withDeadlineAfter(
                properties.getDeadlineMillis(), TimeUnit.MILLISECONDS);
    }

    private ChatRequest toRequest(
            String message, String activeFolderName, AgentContentAccessScope contentAccessScope) {
        return ChatRequest.newBuilder()
                .setMessage(message)
                .setActiveFolderName(activeFolderName == null ? "" : activeFolderName)
                .setContentAccessScope(
                        ContentAccessScope.newBuilder()
                                .setFullContentAccess(contentAccessScope.fullContentAccess())
                                .addAllAllowedPostIds(contentAccessScope.allowedPostIds())
                                .addAllAllowedCategoryIds(contentAccessScope.allowedCategoryIds())
                                .build())
                .build();
    }

    private AgentChatResult toResult(com.kscold.blog.vault.agent.grpc.ChatResponse response) {
        return new AgentChatResult(
                response.getAnswer(),
                response.getStagesList().stream().map(this::toStage).toList(),
                response.getSourcesList().stream().map(this::toSource).toList(),
                List.copyOf(response.getFollowUpsList()));
    }

    private AgentChatResult toCompleted(ChatCompleted response) {
        return new AgentChatResult(
                response.getAnswer(),
                List.of(),
                response.getSourcesList().stream().map(this::toSource).toList(),
                List.copyOf(response.getFollowUpsList()));
    }

    private AgentChatStage toStage(com.kscold.blog.vault.agent.grpc.AgentStage stage) {
        return new AgentChatStage(stage.getName(), stage.getDetail());
    }

    private AgentSource toSource(com.kscold.blog.vault.agent.grpc.SourceNote source) {
        return new AgentSource(
                source.getId(),
                source.getTitle(),
                source.getSlug(),
                source.getScore(),
                source.getType(),
                source.getPath());
    }

    private AgentClientUnavailableException unavailable(StatusRuntimeException exception) {
        log.warn(
                "Vault Agent gRPC 요청에 실패했습니다. target={}:{} status={}",
                properties.getHost(),
                properties.getPort(),
                exception.getStatus());
        return new AgentClientUnavailableException("Vault Agent 서버 응답을 받을 수 없습니다.", exception);
    }
}
