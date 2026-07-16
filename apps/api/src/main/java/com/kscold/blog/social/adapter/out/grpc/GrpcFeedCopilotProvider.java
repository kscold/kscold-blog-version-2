package com.kscold.blog.social.adapter.out.grpc;

import com.kscold.blog.social.domain.exception.FeedCopilotUnavailableException;
import com.kscold.blog.social.domain.model.ExternalArticle;
import com.kscold.blog.social.domain.model.FeedCopilotDraft;
import com.kscold.blog.social.domain.model.FeedCopilotPlan;
import com.kscold.blog.social.domain.model.FeedCopilotReference;
import com.kscold.blog.social.domain.port.out.FeedCopilotProvider;
import com.kscold.blog.vault.agent.application.service.VaultAgentAccessScopeResolver;
import com.kscold.blog.vault.agent.config.VaultAgentProperties;
import com.kscold.blog.vault.agent.domain.model.AgentContentAccessScope;
import com.kscold.blog.vault.agent.grpc.ContentAccessScope;
import com.kscold.blog.vault.agent.grpc.ExternalSource;
import com.kscold.blog.vault.agent.grpc.FeedCopilotDraftRequest;
import com.kscold.blog.vault.agent.grpc.FeedCopilotPlanRequest;
import com.kscold.blog.vault.agent.grpc.SourceNote;
import com.kscold.blog.vault.agent.grpc.VaultAgentServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PreDestroy;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 피드 초안 생성 요청을 Vault Agent gRPC 서비스로 전달하는 어댑터입니다. */
@Slf4j
@Component
public class GrpcFeedCopilotProvider implements FeedCopilotProvider {

    private final VaultAgentProperties properties;
    private final VaultAgentAccessScopeResolver accessScopeResolver;
    private final ManagedChannel channel;
    private final VaultAgentServiceGrpc.VaultAgentServiceBlockingStub blockingStub;

    public GrpcFeedCopilotProvider(
            VaultAgentProperties properties, VaultAgentAccessScopeResolver accessScopeResolver) {
        this.properties = properties;
        this.accessScopeResolver = accessScopeResolver;
        this.channel =
                ManagedChannelBuilder.forAddress(properties.getHost(), properties.getPort())
                        .usePlaintext()
                        .build();
        this.blockingStub = VaultAgentServiceGrpc.newBlockingStub(channel);
    }

    @Override
    public FeedCopilotPlan createPlan(
            String memo, ExternalArticle externalArticle, List<String> styles, String userId) {
        try {
            var response =
                    stub().createFeedPlan(
                                    FeedCopilotPlanRequest.newBuilder()
                                            .setMemo(memo)
                                            .setExternalSource(toExternalSource(externalArticle))
                                            .addAllStyles(styles)
                                            .setContentAccessScope(toScope(userId))
                                            .build());
            return new FeedCopilotPlan(
                    response.getTitle(),
                    response.getAngle(),
                    response.getKeyPointsList(),
                    response.getSourceSummary(),
                    response.getSourcesList().stream().map(this::toReference).toList());
        } catch (StatusRuntimeException exception) {
            throw unavailable(exception);
        }
    }

    @Override
    public FeedCopilotDraft createDraft(
            String memo,
            ExternalArticle externalArticle,
            List<String> styles,
            FeedCopilotPlan plan,
            List<String> styleReferenceKeys,
            String userId) {
        try {
            var response =
                    stub().createFeedDraft(
                                    FeedCopilotDraftRequest.newBuilder()
                                            .setMemo(memo)
                                            .setExternalSource(toExternalSource(externalArticle))
                                            .addAllStyles(styles)
                                            .setPlanTitle(plan.title())
                                            .setPlanAngle(plan.angle())
                                            .addAllPlanKeyPoints(plan.keyPoints())
                                            .addAllStyleReferenceKeys(styleReferenceKeys)
                                            .setContentAccessScope(toScope(userId))
                                            .build());
            return new FeedCopilotDraft(
                    response.getTitle(),
                    response.getContent(),
                    response.getTagsList(),
                    response.getSourcesList().stream().map(this::toReference).toList());
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

    private ContentAccessScope toScope(String userId) {
        AgentContentAccessScope scope = accessScopeResolver.resolve(userId);
        return ContentAccessScope.newBuilder()
                .setFullContentAccess(scope.fullContentAccess())
                .addAllAllowedPostIds(scope.allowedPostIds())
                .addAllAllowedCategoryIds(scope.allowedCategoryIds())
                .build();
    }

    private ExternalSource toExternalSource(ExternalArticle article) {
        return ExternalSource.newBuilder()
                .setUrl(article.url())
                .setTitle(article.title())
                .setDescription(article.description())
                .setSiteName(article.siteName())
                .setContent(article.content())
                .build();
    }

    private FeedCopilotReference toReference(SourceNote source) {
        return new FeedCopilotReference(
                source.getId(),
                source.getTitle(),
                source.getSlug(),
                source.getScore(),
                source.getType(),
                source.getPath(),
                source.getExcerpt());
    }

    private FeedCopilotUnavailableException unavailable(StatusRuntimeException exception) {
        log.warn(
                "피드 작성 Agent gRPC 요청에 실패했습니다. target={}:{} status={}",
                properties.getHost(),
                properties.getPort(),
                exception.getStatus());
        return new FeedCopilotUnavailableException("피드 작성 Agent 응답을 받을 수 없습니다.", exception);
    }
}
