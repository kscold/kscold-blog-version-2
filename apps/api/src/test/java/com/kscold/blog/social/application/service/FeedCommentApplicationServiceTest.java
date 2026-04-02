package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.application.dto.FeedCommentCreateCommand;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import com.kscold.blog.support.UserFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeedCommentApplicationServiceTest {

    @Mock
    private FeedCommentRepository feedCommentRepository;

    @Mock
    private FeedRepository feedRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private FeedCommentApplicationService feedCommentApplicationService;

    @Test
    @DisplayName("시나리오: 로그인 사용자가 댓글을 작성하면 같은 이름의 익명 댓글이 계정에 귀속되고 새 댓글이 저장된다")
    void createClaimsAnonymousCommentsAndSavesNewComment() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        FeedComment legacyComment = FeedComment.builder()
                .id("legacy-1")
                .feedId("feed-1")
                .authorName("kscold")
                .authorPassword("secret")
                .content("예전 익명 댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(feedCommentRepository.findAnonymousByFeedIdAndAuthorNames(eq("feed-1"), anyList()))
                .thenReturn(List.of(legacyComment));
        when(feedCommentRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(feedCommentRepository.save(any(FeedComment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FeedComment saved = feedCommentApplicationService.create(
                "feed-1",
                new FeedCommentCreateCommand(null, null, "새 댓글"),
                "user-1"
        );

        ArgumentCaptor<List<FeedComment>> claimedCaptor = ArgumentCaptor.forClass(List.class);
        verify(feedCommentRepository).saveAll(claimedCaptor.capture());
        FeedComment claimed = claimedCaptor.getValue().get(0);
        assertThat(claimed.getUserId()).isEqualTo("user-1");
        assertThat(claimed.getAuthorName()).isEqualTo("김승찬");
        assertThat(claimed.getAuthorRole()).isEqualTo(User.Role.USER);
        assertThat(claimed.getAuthorPassword()).isNull();

        assertThat(saved.getFeedId()).isEqualTo("feed-1");
        assertThat(saved.getAuthorName()).isEqualTo("김승찬");
        assertThat(saved.getUserId()).isEqualTo("user-1");
        assertThat(saved.getContent()).isEqualTo("새 댓글");
        verify(feedRepository).incrementCommentCount("feed-1");
    }

    @Test
    @DisplayName("시나리오: 로그인 사용자가 댓글 목록을 조회하면 예전 익명 댓글 귀속이 먼저 수행된다")
    void getByFeedIdClaimsAnonymousCommentsBeforeReturningPage() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        FeedComment legacyComment = FeedComment.builder()
                .id("legacy-1")
                .feedId("feed-1")
                .authorName("kscold")
                .content("예전 익명 댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(feedCommentRepository.findAnonymousByFeedIdAndAuthorNames(eq("feed-1"), anyList()))
                .thenReturn(List.of(legacyComment));
        when(feedCommentRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));
        when(feedCommentRepository.findByFeedId(eq("feed-1"), any()))
                .thenReturn(new PageImpl<>(List.of(legacyComment)));

        var page = feedCommentApplicationService.getByFeedId("feed-1", PageRequest.of(0, 20), "user-1");

        assertThat(page.getContent()).hasSize(1);
        var inOrder = inOrder(feedCommentRepository);
        inOrder.verify(feedCommentRepository).findAnonymousByFeedIdAndAuthorNames(eq("feed-1"), anyList());
        inOrder.verify(feedCommentRepository).saveAll(anyList());
        inOrder.verify(feedCommentRepository).findByFeedId(eq("feed-1"), any());
    }

    @Test
    @DisplayName("시나리오: 작성자도 관리자도 아닌 사용자는 다른 사람의 피드 댓글을 삭제할 수 없다")
    void deleteRejectsNonOwner() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        FeedComment comment = FeedComment.builder()
                .id("comment-1")
                .feedId("feed-1")
                .userId("user-2")
                .authorName("다른 사람")
                .content("댓글")
                .build();
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(feedCommentRepository.findAnonymousByFeedIdAndAuthorNames(eq("feed-1"), anyList()))
                .thenReturn(List.of());
        when(feedCommentRepository.findById("comment-1")).thenReturn(Optional.of(comment));

        assertThatThrownBy(() -> feedCommentApplicationService.delete("feed-1", "comment-1", "user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("본인이 작성한 댓글만 삭제할 수 있습니다");

        verify(feedCommentRepository, never()).delete(any());
    }
}
