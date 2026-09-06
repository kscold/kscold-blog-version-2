package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.application.port.in.UserQueryPort.UserInfo;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeedApplicationServiceTest {

    @Mock private FeedRepository feedRepository;

    @Mock private FeedCommentRepository feedCommentRepository;

    @Mock private UserQueryPort userQueryPort;

    @Mock private LinkScrapingPort linkScrapingPort;

    private FeedApplicationService feedApplicationService;

    @BeforeEach
    void setUp() {
        feedApplicationService =
                new FeedApplicationService(
                        feedRepository,
                        feedCommentRepository,
                        userQueryPort,
                        linkScrapingPort,
                        new FeedInputPolicy("https://bucket.kscold.com", "blog"));
    }

    private void stubFeedCreation() {
        when(userQueryPort.getUserById("user-1"))
                .thenReturn(
                        new UserInfo(
                                "user-1",
                                "feed-user",
                                "피드 사용자",
                                "avatar.png",
                                false,
                                "feed@example.com"));
        when(feedRepository.save(any(Feed.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    @DisplayName("시나리오: 본문 없이 이미지만 있는 피드도 작성할 수 있다")
    void createAllowsImageOnlyFeed() {
        stubFeedCreation();

        Feed created =
                feedApplicationService.create(
                        FeedCreateCommand.builder()
                                .content("  ")
                                .images(List.of("https://bucket.kscold.com/blog/feed.png"))
                                .build(),
                        "user-1");

        assertThat(created.getContent()).isEmpty();
        assertThat(created.getImages()).containsExactly("https://bucket.kscold.com/blog/feed.png");
    }

    @Test
    @DisplayName("시나리오: 본문과 이미지가 모두 비어 있으면 피드를 저장하지 않는다")
    void createRejectsFeedWithoutContent() {
        FeedCreateCommand command =
                FeedCreateCommand.builder().content(" ").images(List.of()).build();

        assertThatThrownBy(() -> feedApplicationService.create(command, "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("내용 또는 이미지를 입력해주세요");

        verify(userQueryPort, never()).getUserById(any());
        verify(feedRepository, never()).save(any());
    }

    @Test
    @DisplayName("시나리오: 잘못된 생성 입력은 사용자 조회와 링크 조회 및 저장보다 먼저 거부한다")
    void createRejectsInvalidInputBeforeSideEffects() {
        FeedCreateCommand command =
                FeedCreateCommand.builder()
                        .content("a".repeat(10_001))
                        .linkUrl("https://example.com")
                        .build();

        assertThatThrownBy(() -> feedApplicationService.create(command, "user-1"))
                .isInstanceOf(InvalidRequestException.class);

        verify(userQueryPort, never()).getUserById(any());
        verify(linkScrapingPort, never()).scrape(any());
        verify(feedRepository, never()).save(any());
    }

    @Test
    @DisplayName("시나리오: 수정에서 생략한 링크는 기존 미리보기를 유지한다")
    void updateKeepsLinkWhenOmitted() {
        Feed.LinkPreview preview =
                Feed.LinkPreview.builder().url("https://example.com/old").build();
        Feed feed = existingFeed(preview);
        when(feedRepository.findById("feed-1")).thenReturn(java.util.Optional.of(feed));
        when(feedRepository.save(feed)).thenReturn(feed);

        Feed updated =
                feedApplicationService.update(
                        "feed-1", FeedUpdateCommand.builder().content("수정 내용").build());

        assertThat(updated.getLinkPreview()).isSameAs(preview);
        verify(linkScrapingPort, never()).scrape(any());
    }

    @Test
    @DisplayName("시나리오: 수정에서 빈 링크는 기존 미리보기를 삭제한다")
    void updateRemovesLinkWhenBlank() {
        Feed feed = existingFeed(Feed.LinkPreview.builder().url("https://example.com/old").build());
        when(feedRepository.findById("feed-1")).thenReturn(java.util.Optional.of(feed));
        when(feedRepository.save(feed)).thenReturn(feed);

        Feed updated =
                feedApplicationService.update(
                        "feed-1", FeedUpdateCommand.builder().linkUrl("  ").build());

        assertThat(updated.getLinkPreview()).isNull();
        verify(linkScrapingPort, never()).scrape(any());
    }

    @Test
    @DisplayName("시나리오: 수정 뒤 본문과 이미지가 모두 비면 외부 조회와 저장 없이 거부한다")
    void updateRejectsEmptyFinalStateBeforeSideEffects() {
        Feed feed = existingFeed(null);
        when(feedRepository.findById("feed-1")).thenReturn(java.util.Optional.of(feed));
        FeedUpdateCommand command =
                FeedUpdateCommand.builder()
                        .content(" ")
                        .images(List.of())
                        .linkUrl("https://example.com")
                        .build();

        assertThatThrownBy(() -> feedApplicationService.update("feed-1", command))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("내용 또는 이미지를 입력해주세요");

        verify(linkScrapingPort, never()).scrape(any());
        verify(feedRepository, never()).save(any());
    }

    @Test
    @DisplayName("시나리오: 수정 이미지 목록은 호출자가 바꿀 수 없도록 복사한다")
    void updateDefensivelyCopiesImages() {
        Feed feed = existingFeed(null);
        when(feedRepository.findById("feed-1")).thenReturn(java.util.Optional.of(feed));
        when(feedRepository.save(feed)).thenReturn(feed);
        List<String> images = new ArrayList<>(List.of("https://bucket.kscold.com/blog/feed.png"));

        Feed updated =
                feedApplicationService.update(
                        "feed-1", FeedUpdateCommand.builder().images(images).build());
        images.clear();

        assertThat(updated.getImages()).containsExactly("https://bucket.kscold.com/blog/feed.png");
    }

    @Test
    void returnsOnlyTheMinimalSitemapIndex() {
        Instant createdAt = Instant.parse("2026-09-01T00:00:00Z");
        Instant updatedAt = Instant.parse("2026-09-02T00:00:00Z");
        when(feedRepository.findAllPublicForSitemap())
                .thenReturn(
                        List.of(
                                new FeedRepository.SitemapFeed(
                                        "feed-1", 120, createdAt, updatedAt)));

        assertThat(feedApplicationService.getSitemapIndex())
                .singleElement()
                .satisfies(
                        feed -> {
                            assertThat(feed.id()).isEqualTo("feed-1");
                            assertThat(feed.contentLength()).isEqualTo(120);
                            assertThat(feed.createdAt()).isEqualTo(createdAt);
                            assertThat(feed.updatedAt()).isEqualTo(updatedAt);
                        });
    }

    private Feed existingFeed(Feed.LinkPreview preview) {
        return Feed.builder()
                .id("feed-1")
                .content("기존 내용")
                .images(new ArrayList<>())
                .visibility(Feed.Visibility.PUBLIC)
                .linkPreview(preview)
                .build();
    }
}
