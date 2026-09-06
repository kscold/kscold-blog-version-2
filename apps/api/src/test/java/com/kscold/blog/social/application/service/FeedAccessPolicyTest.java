package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FeedAccessPolicyTest {

    private FeedRepository feedRepository;
    private FeedAccessPolicy policy;

    @BeforeEach
    void setUp() {
        feedRepository = mock(FeedRepository.class);
        policy = new FeedAccessPolicy(feedRepository);
    }

    @Test
    void 공개_피드는_비로그인도_읽을_수_있다() {
        Feed feed = feed(Feed.Visibility.PUBLIC);
        when(feedRepository.findById("feed-1")).thenReturn(Optional.of(feed));

        assertThat(policy.requireReadable("feed-1", null, false)).isSameAs(feed);
    }

    @Test
    void 비공개_피드는_작성자와_관리자만_읽을_수_있다() {
        Feed feed = feed(Feed.Visibility.PRIVATE);
        when(feedRepository.findById("feed-1")).thenReturn(Optional.of(feed));

        assertThat(policy.requireReadable("feed-1", "owner-1", false)).isSameAs(feed);
        assertThat(policy.requireReadable("feed-1", null, true)).isSameAs(feed);
    }

    @Test
    void 비공개_피드는_익명과_다른_사용자에게_없는_것처럼_응답한다() {
        Feed feed = feed(Feed.Visibility.PRIVATE);
        when(feedRepository.findById("feed-1")).thenReturn(Optional.of(feed));

        assertThatThrownBy(() -> policy.requireReadable("feed-1", "anonymousUser", false))
                .isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> policy.requireReadable("feed-1", "other-1", false))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    private Feed feed(Feed.Visibility visibility) {
        return Feed.builder()
                .id("feed-1")
                .visibility(visibility)
                .author(Feed.AuthorInfo.builder().id("owner-1").build())
                .build();
    }
}
