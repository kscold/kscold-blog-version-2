package com.kscold.blog.vault.agent.adapter.out.grpc;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.domain.model.AgentStreamSession;
import com.kscold.blog.vault.agent.grpc.ChatRequest;
import com.kscold.blog.vault.agent.grpc.ChatStreamEvent;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.grpc.stub.ServerCallStreamObserver;
import io.grpc.stub.StreamObserver;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class GrpcVaultAgentClientTest {
    @Test
    void cancellationStopsBlockedGrpcCallBeforeDeadline() throws Exception {
        CountDownLatch started = new CountDownLatch(1);
        CountDownLatch cancelled = new CountDownLatch(1);
        Server server =
                ServerBuilder.forPort(0)
                        .addService(
                                new VaultAgentServiceGrpc.VaultAgentServiceImplBase() {
                                    @Override
                                    public void chatStream(
                                            ChatRequest request,
                                            StreamObserver<ChatStreamEvent> response) {
                                        ((ServerCallStreamObserver<ChatStreamEvent>) response)
                                                .setOnCancelHandler(cancelled::countDown);
                                        started.countDown();
                                    }
                                })
                        .build()
                        .start();
        var properties = new VaultAgentProperties();
        properties.setHost("127.0.0.1");
        properties.setPort(server.getPort());
        properties.setDeadlineMillis(60000);
        var client = new GrpcVaultAgentClient(properties);
        var session = new AgentStreamSession();
        AtomicReference<Throwable> failure = new AtomicReference<>();
        Thread worker =
                new Thread(
                        () -> {
                            try {
                                client.streamChat(
                                        "질문",
                                        "",
                                        AgentContentAccessScope.publicOnly(),
                                        session,
                                        ignored -> {});
                            } catch (Throwable error) {
                                failure.set(error);
                            }
                        });
        try {
            worker.start();
            assertThat(started.await(3, TimeUnit.SECONDS)).isTrue();
            session.close();
            assertThat(cancelled.await(3, TimeUnit.SECONDS)).isTrue();
            worker.join(3000);
            assertThat(worker.isAlive()).isFalse();
            assertThat(failure.get()).isNull();
        } finally {
            session.close();
            client.shutdown();
            server.shutdownNow();
        }
    }
}
