package com.kscold.blog.vault.agent.adapter.out.grpc;

import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.exception.AgentClientUnavailableException;
import com.kscold.blog.vault.agent.domain.model.AgentChatResult;
import com.kscold.blog.vault.agent.domain.model.AgentChatStage;
import com.kscold.blog.vault.agent.domain.model.AgentSource;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentQuery;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import com.kscold.blog.vault.agent.domain.port.out.PageAgentClientPort;
import com.kscold.blog.vault.agent.grpc.ChatStreamEvent;
import com.kscold.blog.vault.agent.grpc.PageChatRequest;
import com.kscold.blog.vault.agent.grpc.PageContext;
import com.kscold.blog.vault.agent.grpc.PageConversationMessage;
import com.kscold.blog.vault.agent.grpc.PageSection;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.Context;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PreDestroy;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;
import org.springframework.stereotype.Component;

@Component
public class GrpcPageAgentClient implements PageAgentClientPort {

    private final ManagedChannel channel;
    private final VaultAgentServiceGrpc.VaultAgentServiceBlockingStub stub;
    private final long deadlineMillis;

    public GrpcPageAgentClient(VaultAgentProperties properties) {
        channel =
                ManagedChannelBuilder.forAddress(properties.getHost(), properties.getPort())
                        .usePlaintext()
                        .build();
        stub = VaultAgentServiceGrpc.newBlockingStub(channel);
        deadlineMillis = Math.max(1, Math.min(properties.getDeadlineMillis(), 60000));
    }

    @Override
    public void stream(
            PageAgentQuery query,
            PageAgentStreamSession session,
            Consumer<AgentStreamEvent> receiver) {
        try (Context.CancellableContext cancellation = Context.current().withCancellation()) {
            session.onCancel(() -> cancellation.cancel(null));
            cancellation.run(() -> consume(toRequest(query), session, receiver));
        } catch (StatusRuntimeException exception) {
            if (session.isActive()) {
                throw new AgentClientUnavailableException("페이지 Agent 연결을 완료하지 못했습니다.", null);
            }
        }
    }

    private void consume(
            PageChatRequest request,
            PageAgentStreamSession session,
            Consumer<AgentStreamEvent> receiver) {
        Iterator<ChatStreamEvent> events =
                stub.withDeadlineAfter(deadlineMillis, TimeUnit.MILLISECONDS)
                        .pageChatStream(request);
        while (session.isActive() && events.hasNext()) {
            ChatStreamEvent event = events.next();
            switch (event.getEventCase()) {
                case STAGE ->
                        receiver.accept(
                                AgentStreamEvent.stage(
                                        new AgentChatStage(
                                                event.getStage().getName(),
                                                event.getStage().getDetail())));
                case DELTA -> receiver.accept(AgentStreamEvent.delta(event.getDelta()));
                case COMPLETED -> receiver.accept(AgentStreamEvent.completed(toResult(event)));
                case EVENT_NOT_SET -> {}
            }
        }
    }

    private PageChatRequest toRequest(PageAgentQuery query) {
        PageContext.Builder context =
                PageContext.newBuilder()
                        .setTitle(query.context().title())
                        .setPath(query.context().path());
        query.context()
                .sections()
                .forEach(
                        section ->
                                context.addSections(
                                        PageSection.newBuilder()
                                                .setId(section.id())
                                                .setTitle(section.title())
                                                .setContent(section.content())));
        PageChatRequest.Builder request =
                PageChatRequest.newBuilder().setMessage(query.message()).setPageContext(context);
        query.conversation()
                .forEach(
                        message ->
                                request.addConversation(
                                        PageConversationMessage.newBuilder()
                                                .setRole(message.role())
                                                .setContent(message.content())));
        return request.build();
    }

    private AgentChatResult toResult(ChatStreamEvent event) {
        var result = event.getCompleted();
        var stages =
                result.getStagesList().stream()
                        .map(stage -> new AgentChatStage(stage.getName(), stage.getDetail()))
                        .toList();
        var sources =
                result.getSourcesList().stream()
                        .map(
                                source ->
                                        new AgentSource(
                                                source.getId(),
                                                source.getTitle(),
                                                source.getSlug(),
                                                source.getScore(),
                                                "page",
                                                source.getPath(),
                                                source.getExcerpt()))
                        .toList();
        return new AgentChatResult(result.getAnswer(), stages, sources, List.of());
    }

    @PreDestroy
    public void shutdown() {
        channel.shutdownNow();
    }
}
