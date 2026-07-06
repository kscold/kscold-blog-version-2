package com.kscold.blog.vault.agent;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.vault.agent.grpc.ChatRequest;
import com.kscold.blog.vault.agent.grpc.ReindexRequest;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

import static com.kscold.blog.vault.agent.VaultAgentDtos.AgentStage;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ChatResponse;
import static com.kscold.blog.vault.agent.VaultAgentDtos.ReindexResponse;
import static com.kscold.blog.vault.agent.VaultAgentDtos.SourceNote;

@Slf4j
@Service
public class VaultAgentService {

    private final VaultAgentProperties properties;
    private final ManagedChannel channel;
    private final VaultAgentServiceGrpc.VaultAgentServiceBlockingStub blockingStub;

    public VaultAgentService(VaultAgentProperties properties) {
        this.properties = properties;
        this.channel = io.grpc.ManagedChannelBuilder
                .forAddress(properties.getHost(), properties.getPort())
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
                    response.getSkippedNotes()
            );
        } catch (StatusRuntimeException exception) {
            throw agentUnavailable(exception);
        }
    }

    public ChatResponse chat(VaultAgentDtos.ChatRequest request) {
        try {
            var response = stub().chat(ChatRequest.newBuilder()
                    .setMessage(request.message())
                    .setActiveFolderName(request.activeFolderName() == null ? "" : request.activeFolderName())
                    .build());

            return new ChatResponse(
                    response.getAnswer(),
                    response.getStagesList().stream()
                            .map(stage -> new AgentStage(stage.getName(), stage.getDetail()))
                            .toList(),
                    response.getSourcesList().stream()
                            .map(source -> new SourceNote(
                                    source.getId(),
                                    source.getTitle(),
                                    source.getSlug(),
                                    source.getScore()
                            ))
                            .toList()
            );
        } catch (StatusRuntimeException exception) {
            throw agentUnavailable(exception);
        }
    }

    @PreDestroy
    public void shutdown() throws InterruptedException {
        channel.shutdown().awaitTermination(5, TimeUnit.SECONDS);
    }

    private VaultAgentServiceGrpc.VaultAgentServiceBlockingStub stub() {
        return blockingStub.withDeadlineAfter(properties.getDeadlineMillis(), TimeUnit.MILLISECONDS);
    }

    private BusinessException agentUnavailable(StatusRuntimeException exception) {
        log.warn(
                "Vault Agent gRPC request failed target={}:{} status={}",
                properties.getHost(),
                properties.getPort(),
                exception.getStatus(),
                exception
        );
        return new BusinessException(ErrorCode.EXTERNAL_API_ERROR, "Vault Agent 서버 응답을 받을 수 없습니다.");
    }
}
