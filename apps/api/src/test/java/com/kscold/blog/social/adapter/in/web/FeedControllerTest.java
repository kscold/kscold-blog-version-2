package com.kscold.blog.social.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.request.FeedCreateRequest;
import com.kscold.blog.social.adapter.in.web.dto.request.FeedUpdateRequest;
import com.kscold.blog.social.adapter.in.web.dto.response.FeedResponse;
import com.kscold.blog.social.application.dto.command.FeedCreateCommand;
import com.kscold.blog.social.application.dto.command.FeedUpdateCommand;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.application.service.FeedAccessPolicy;
import com.kscold.blog.social.domain.model.Feed;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.ResponseEntity;

class FeedControllerTest {

    private FeedUseCase feedUseCase;
    private ClientIdentifierResolver clientIdentifierResolver;
    private UserQueryPort userQueryPort;
    private FeedController controller;

    @BeforeEach
    void setUp() {
        feedUseCase = mock(FeedUseCase.class);
        clientIdentifierResolver = mock(ClientIdentifierResolver.class);
        userQueryPort = mock(UserQueryPort.class);
        controller =
                new FeedController(
                        feedUseCase,
                        clientIdentifierResolver,
                        mock(ViewCounter.class),
                        userQueryPort,
                        mock(FeedAccessPolicy.class));
    }

    @Test
    @DisplayName("시나리오: 피드 목록의 중복 작성자를 모아 한 번에 최신 프로필을 조회한다")
    void getPublicFeedsLoadsDistinctAuthorsOnce() {
        Feed first = feed("feed-1", "user-1");
        Feed second = feed("feed-2", "user-2");
        Feed duplicate = feed("feed-3", "user-1");
        when(feedUseCase.getPublicFeeds(any()))
                .thenReturn(new PageImpl<>(List.of(first, second, duplicate)));
        when(clientIdentifierResolver.resolve(any())).thenReturn("anonymous");
        when(userQueryPort.getUsersByIds(any()))
                .thenReturn(
                        Map.of(
                                "user-1", userInfo("user-1", "최신 첫 번째"),
                                "user-2", userInfo("user-2", "최신 두 번째")));

        ResponseEntity<ApiResponse<Page<FeedResponse>>> response =
                controller.getPublicFeeds(0, 12, null, null, mock(HttpServletRequest.class));

        assertThat(response.getBody().getData().getContent())
                .extracting(item -> item.getAuthor().getName())
                .containsExactly("최신 첫 번째", "최신 두 번째", "최신 첫 번째");
        ArgumentCaptor<Collection<String>> ids = ArgumentCaptor.forClass(Collection.class);
        verify(userQueryPort).getUsersByIds(ids.capture());
        assertThat(ids.getValue()).containsExactly("user-1", "user-2");
        verify(userQueryPort, never()).getUserById(any());
    }

    @Test
    @DisplayName("시나리오: 공개 피드 페이지 상한을 넘으면 조회를 실행하지 않는다")
    void excessivePublicFeedPageIsRejectedBeforeQuery() {
        assertThatThrownBy(
                        () ->
                                controller.getPublicFeeds(
                                        500, 12, null, null, mock(HttpServletRequest.class)))
                .isInstanceOf(InvalidRequestException.class);

        verifyNoInteractions(feedUseCase);
    }

    @Test
    @DisplayName("시나리오: Spring 익명 principal은 피드 좋아요 식별자로 사용하지 않는다")
    void anonymousPrincipalUsesClientIdentifier() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(feedUseCase.getPublicFeeds(any())).thenReturn(new PageImpl<>(List.of()));
        when(clientIdentifierResolver.resolve(request)).thenReturn("client-1");

        controller.getPublicFeeds(0, 12, null, "anonymousUser", request);

        verify(clientIdentifierResolver).resolve(request);
    }

    @Test
    @DisplayName("시나리오: 활성 작성자 정보가 없으면 공개 피드의 저장된 작성자 정보를 유지한다")
    void publicFeedKeepsAuthorSnapshotWhenActiveProfileIsMissing() {
        Feed savedFeed = feed("feed-1", "deleted-user");
        when(feedUseCase.getPublicFeeds(any())).thenReturn(new PageImpl<>(List.of(savedFeed)));
        when(clientIdentifierResolver.resolve(any())).thenReturn("anonymous");
        when(userQueryPort.getUsersByIds(any())).thenReturn(Map.of());

        ResponseEntity<ApiResponse<Page<FeedResponse>>> response =
                controller.getPublicFeeds(0, 12, null, null, mock(HttpServletRequest.class));

        FeedResponse.AuthorInfo author =
                response.getBody().getData().getContent().getFirst().getAuthor();
        assertThat(author.getId()).isEqualTo("deleted-user");
        assertThat(author.getUsername()).isEqualTo("old");
        assertThat(author.getName()).isEqualTo("저장된 이름");
    }

    @Test
    @DisplayName("시나리오: 피드 생성 웹 요청을 애플리케이션 명령으로 변환한다")
    void createFeedMapsRequestToCommand() {
        FeedCreateRequest request =
                FeedCreateRequest.builder()
                        .content("본문")
                        .images(List.of("https://bucket.kscold.com/blog/feed.png"))
                        .visibility(Feed.Visibility.PRIVATE)
                        .linkUrl("https://example.com")
                        .build();
        when(feedUseCase.create(any(FeedCreateCommand.class), eq("user-1")))
                .thenReturn(Feed.builder().content("본문").build());

        controller.createFeed(request, "user-1");

        ArgumentCaptor<FeedCreateCommand> command =
                ArgumentCaptor.forClass(FeedCreateCommand.class);
        verify(feedUseCase).create(command.capture(), eq("user-1"));
        assertThat(command.getValue().getContent()).isEqualTo("본문");
        assertThat(command.getValue().getImages())
                .containsExactly("https://bucket.kscold.com/blog/feed.png");
        assertThat(command.getValue().getVisibility()).isEqualTo(Feed.Visibility.PRIVATE);
        assertThat(command.getValue().getLinkUrl()).isEqualTo("https://example.com");
    }

    @Test
    @DisplayName("시나리오: 피드 수정 웹 요청에서 생략한 필드를 명령에도 유지한다")
    void updateFeedMapsRequestToCommand() {
        FeedUpdateRequest request = FeedUpdateRequest.builder().content("수정 본문").build();
        when(feedUseCase.update(eq("feed-1"), any(FeedUpdateCommand.class)))
                .thenReturn(Feed.builder().id("feed-1").content("수정 본문").build());

        controller.updateFeed("feed-1", request, "user-1");

        ArgumentCaptor<FeedUpdateCommand> command =
                ArgumentCaptor.forClass(FeedUpdateCommand.class);
        verify(feedUseCase).update(eq("feed-1"), command.capture());
        assertThat(command.getValue().getContent()).isEqualTo("수정 본문");
        assertThat(command.getValue().getImages()).isNull();
        assertThat(command.getValue().getLinkUrl()).isNull();
    }

    private Feed feed(String id, String authorId) {
        return Feed.builder()
                .id(id)
                .content("content")
                .author(
                        Feed.AuthorInfo.builder()
                                .id(authorId)
                                .username("old")
                                .name("저장된 이름")
                                .build())
                .build();
    }

    private UserQueryPort.UserInfo userInfo(String id, String displayName) {
        return new UserQueryPort.UserInfo(id, id, displayName, null, false, null);
    }
}
