package com.kscold.blog.social.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.application.dto.command.FeedCommentCreateCommand;
import com.kscold.blog.social.application.event.FeedCommentCreatedEvent;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.support.UserFixtures;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

@ExtendWith(MockitoExtension.class)
class FeedCommentApplicationServiceTest {

    @Mock private FeedCommentRepository feedCommentRepository;

    @Mock private FeedRepository feedRepository;

    @Mock private UserRepository userRepository;

    @Mock private FeedMentionResolver mentionResolver;

    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private FeedCommentApplicationService feedCommentApplicationService;

    @Test
    @DisplayName("시나리오: 로그인 사용자가 댓글을 작성하면 새 댓글만 계정 소유로 저장된다")
    void createSavesNewAuthenticatedComment() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(feedCommentRepository.save(any(FeedComment.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FeedComment saved =
                feedCommentApplicationService.create(
                        "feed-1", new FeedCommentCreateCommand(null, null, "새 댓글"), "user-1");

        assertThat(saved.getFeedId()).isEqualTo("feed-1");
        assertThat(saved.getAuthorName()).isEqualTo("김승찬");
        assertThat(saved.getUserId()).isEqualTo("user-1");
        assertThat(saved.getContent()).isEqualTo("새 댓글");
        verify(feedRepository).incrementCommentCount("feed-1");

        ArgumentCaptor<FeedCommentCreatedEvent> eventCaptor = ArgumentCaptor.captor();
        verify(eventPublisher).publishEvent(eventCaptor.capture());
        FeedCommentCreatedEvent event = eventCaptor.getValue();
        assertThat(event.feedId()).isEqualTo("feed-1");
        assertThat(event.authorUserId()).isEqualTo("user-1");
        assertThat(event.authorName()).isEqualTo("김승찬");
        assertThat(event.authorIsAdmin()).isFalse();
        assertThat(event.content()).isEqualTo("새 댓글");
    }

    @Test
    @DisplayName("시나리오: 로그인 사용자가 댓글을 조회해도 같은 이름의 익명 댓글 소유권은 유지된다")
    void getByFeedIdDoesNotClaimAnonymousCommentByName() {
        FeedComment legacyComment =
                FeedComment.builder()
                        .id("legacy-1")
                        .feedId("feed-1")
                        .authorName("kscold")
                        .authorPassword("기존-검증값")
                        .content("예전 익명 댓글")
                        .build();
        when(feedCommentRepository.findByFeedId(eq("feed-1"), any()))
                .thenReturn(new PageImpl<>(List.of(legacyComment)));

        var page = feedCommentApplicationService.getByFeedId("feed-1", PageRequest.of(0, 20));

        assertThat(page.getContent().get(0).getUserId()).isNull();
        assertThat(page.getContent().get(0).getAuthorPassword()).isEqualTo("기존-검증값");
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("시나리오: 작성자도 관리자도 아닌 사용자는 다른 사람의 피드 댓글을 삭제할 수 없다")
    void deleteRejectsNonOwner() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        FeedComment comment =
                FeedComment.builder()
                        .id("comment-1")
                        .feedId("feed-1")
                        .userId("user-2")
                        .authorName("다른 사람")
                        .content("댓글")
                        .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(feedCommentRepository.findById("comment-1")).thenReturn(Optional.of(comment));

        assertThatThrownBy(
                        () -> feedCommentApplicationService.delete("feed-1", "comment-1", "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("본인이 작성한 댓글만 삭제할 수 있습니다");

        verify(feedCommentRepository, never()).delete(any());
    }

    @Test
    @DisplayName("시나리오: 비로그인 방문자가 댓글 좋아요를 누르면 식별자로 토글되고 갱신된 댓글이 반환된다")
    void toggleLikeUsesIdentifierAndReturnsUpdatedComment() {
        FeedComment before = FeedComment.builder().id("comment-1").feedId("feed-1").build();
        FeedComment after =
                FeedComment.builder().id("comment-1").feedId("feed-1").likesCount(1).build();
        when(feedCommentRepository.findById("comment-1"))
                .thenReturn(Optional.of(before))
                .thenReturn(Optional.of(after));

        FeedComment result =
                feedCommentApplicationService.toggleLike("feed-1", "comment-1", "1.2.3.4|ab12");

        verify(feedCommentRepository).toggleLike("comment-1", "1.2.3.4|ab12");
        assertThat(result.getLikesCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("시나리오: 다른 글의 댓글 아이디로 좋아요를 누르면 거부되고 토글이 일어나지 않는다")
    void toggleLikeRejectsCommentFromAnotherFeed() {
        FeedComment otherFeedComment =
                FeedComment.builder().id("comment-1").feedId("feed-2").build();
        when(feedCommentRepository.findById("comment-1")).thenReturn(Optional.of(otherFeedComment));

        assertThatThrownBy(
                        () ->
                                feedCommentApplicationService.toggleLike(
                                        "feed-1", "comment-1", "user-1"))
                .isInstanceOf(InvalidRequestException.class);
        verify(feedCommentRepository, never()).toggleLike(any(), any());
    }
}
