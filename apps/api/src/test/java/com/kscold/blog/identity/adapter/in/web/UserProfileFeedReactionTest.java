package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.kscold.blog.identity.application.dto.response.PublicProfileResponse;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.shared.web.RequestViewerIdentifier;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.Feed;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;

class UserProfileFeedReactionTest {
    @Test
    void profileFeedUsesViewerRatherThanAuthorForLikeState() {
        UserProfileUseCase profiles = mock(UserProfileUseCase.class);
        FeedUseCase feeds = mock(FeedUseCase.class);
        RequestViewerIdentifier viewer = mock(RequestViewerIdentifier.class);
        var controller =
                new UserProfileController(
                        profiles, mock(UserManagementUseCase.class), feeds, viewer);
        when(viewer.resolve()).thenReturn("viewer");
        when(profiles.getPublicProfile("author"))
                .thenReturn(
                        PublicProfileResponse.builder()
                                .id("author-id")
                                .username("author")
                                .displayName("작성자")
                                .build());
        when(feeds.getPublicFeedsByAuthorId(eq("author-id"), any()))
                .thenReturn(
                        new PageImpl<>(
                                List.of(
                                        Feed.builder()
                                                .id("feed")
                                                .likedBy(Set.of("viewer"))
                                                .likesCount(1)
                                                .build())));
        var response =
                controller
                        .getUserFeeds("author", 0, 12)
                        .getBody()
                        .getData()
                        .getContent()
                        .getFirst();
        assertThat(response.getIsLiked()).isTrue();
        assertThat(response.getLikesCount()).isEqualTo(1);
    }
}
