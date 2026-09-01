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
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.social.domain.port.out.LinkScrapingPort;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FeedApplicationServiceTest {

    @Mock private FeedRepository feedRepository;

    @Mock private FeedCommentRepository feedCommentRepository;

    @Mock private UserQueryPort userQueryPort;

    @Mock private LinkScrapingPort linkScrapingPort;

    @InjectMocks private FeedApplicationService feedApplicationService;

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
                                .images(List.of("https://cdn.example.com/feed.png", " "))
                                .build(),
                        "user-1");

        assertThat(created.getContent()).isEmpty();
        assertThat(created.getImages()).containsExactly("https://cdn.example.com/feed.png");
    }

    @Test
    @DisplayName("시나리오: 본문과 이미지가 모두 비어 있으면 피드를 저장하지 않는다")
    void createRejectsFeedWithoutContent() {
        FeedCreateCommand command =
                FeedCreateCommand.builder().content(" ").images(List.of("", " ")).build();

        assertThatThrownBy(() -> feedApplicationService.create(command, "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("내용 또는 이미지를 입력해주세요");

        verify(userQueryPort, never()).getUserById(any());
        verify(feedRepository, never()).save(any());
    }
}
