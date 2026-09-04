package com.kscold.blog.social.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.analytics.application.service.ViewCounter;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.response.FeedResponse;
import com.kscold.blog.social.application.port.in.FeedUseCase;
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
                        userQueryPort);
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
