package com.kscold.blog.vault.agent.adapter.out.grpc;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.AgentStreamEvent;
import com.kscold.blog.vault.agent.domain.model.PageAgentQuery;
import com.kscold.blog.vault.agent.domain.model.PageAgentStreamSession;
import com.kscold.blog.vault.agent.grpc.ChatCompleted;
import com.kscold.blog.vault.agent.grpc.ChatStreamEvent;
import com.kscold.blog.vault.agent.grpc.PageChatRequest;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.ServerCallStreamObserver;
import io.grpc.stub.StreamObserver;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class GrpcPageAgentClientTest {

    @Test
    void usesSeparateRpcWithPageSourcesAndNoAccessScopeOrSessionFields() throws Exception {
        AtomicReference<PageChatRequest> received = new AtomicReference<>();
        Server server =
                ServerBuilder.forPort(0)
                        .addService(
                                new VaultAgentServiceGrpc.VaultAgentServiceImplBase() {
                                    @Override
                                    public void pageChatStream(
                                            PageChatRequest request,
                                            StreamObserver<ChatStreamEvent> response) {
                                        received.set(request);
                                        response.onNext(
                                                ChatStreamEvent.newBuilder()
                                                        .setDelta("공개 페이지 답변")
                                                        .build());
                                        response.onNext(
                                                ChatStreamEvent.newBuilder()
                                                        .setCompleted(
                                                                ChatCompleted.newBuilder()
                                                                        .setAnswer("공개 페이지 답변"))
                                                        .build());
                                        response.onCompleted();
                                    }
                                })
                        .build()
                        .start();
        GrpcPageAgentClient client = client(server.getPort());
        try {
            List<AgentStreamEvent> events = new ArrayList<>();
            client.stream(query(), new PageAgentStreamSession(() -> {}), events::add);
            assertThat(received.get().getPageContext().getSections(0).getContent())
                    .isEqualTo("팀 협업 설명");
            assertThat(received.get().getDescriptorForType().getFields())
                    .extracting(field -> field.getName())
                    .containsExactly("message", "page_context", "conversation");
            assertThat(events)
                    .extracting(AgentStreamEvent::type)
                    .containsExactly(AgentStreamEvent.Type.DELTA, AgentStreamEvent.Type.COMPLETED);
        } finally {
            client.shutdown();
            server.shutdownNow();
        }
    }

    @Test
    void cancellationClosesGrpcTransportWithoutWaitingForDeadline() throws Exception {
        CountDownLatch started = new CountDownLatch(1);
        CountDownLatch cancelled = new CountDownLatch(1);
        Server server =
                ServerBuilder.forPort(0)
                        .addService(
                                new VaultAgentServiceGrpc.VaultAgentServiceImplBase() {
                                    @Override
                                    public void pageChatStream(
                                            PageChatRequest request,
                                            StreamObserver<ChatStreamEvent> response) {
                                        ((ServerCallStreamObserver<ChatStreamEvent>) response)
                                                .setOnCancelHandler(cancelled::countDown);
                                        started.countDown();
                                    }
                                })
                        .build()
                        .start();
        GrpcPageAgentClient client = client(server.getPort());
        var session = new PageAgentStreamSession(() -> {});
        AtomicReference<Throwable> error = new AtomicReference<>();
        Thread worker =
                new Thread(
                        () -> {
                            try {
                                client.stream(query(), session, ignored -> {});
                            } catch (Throwable thrown) {
                                error.set(thrown);
                            }
                        });
        try {
            worker.start();
            assertThat(started.await(3, TimeUnit.SECONDS)).isTrue();
            session.close();
            assertThat(cancelled.await(3, TimeUnit.SECONDS)).isTrue();
            worker.join(3000);
            assertThat(worker.isAlive()).isFalse();
            assertThat(error.get()).isNull();
        } finally {
            session.close();
            client.shutdown();
            server.shutdownNow();
        }
    }

    private GrpcPageAgentClient client(int port) {
        var properties = new VaultAgentProperties();
        properties.setHost("127.0.0.1");
        properties.setPort(port);
        return new GrpcPageAgentClient(properties);
    }

    @Test
    void refreshesDeadlinePerRequestInsteadOfExpiringAfterStartup() throws Exception {
        Server server =
                ServerBuilder.forPort(0)
                        .addService(
                                new VaultAgentServiceGrpc.VaultAgentServiceImplBase() {
                                    @Override
                                    public void pageChatStream(
                                            PageChatRequest request,
                                            StreamObserver<ChatStreamEvent> response) {
                                        response.onCompleted();
                                    }
                                })
                        .build()
                        .start();
        var properties = new VaultAgentProperties();
        properties.setHost("127.0.0.1");
        properties.setPort(server.getPort());
        properties.setDeadlineMillis(1000);
        var client = new GrpcPageAgentClient(properties);
        try {
            client.stream(query(), new PageAgentStreamSession(() -> {}), ignored -> {});
            Thread.sleep(1100);
            client.stream(query(), new PageAgentStreamSession(() -> {}), ignored -> {});
        } finally {
            client.shutdown();
            server.shutdownNow();
        }
    }

    private PageAgentQuery query() {
        return new PageAgentQuery(
                "역할 질문",
                new PageAgentQuery.Context(
                        "작업 소개",
                        "/work-sample",
                        List.of(new PageAgentQuery.Section("one", "자료", "팀 협업 설명"))),
                List.of());
    }
}
