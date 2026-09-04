package com.kscold.blog.social.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.response.FeedCommentResponse;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

@ExtendWith(MockitoExtension.class)
class FeedCommentControllerTest {

    @Mock private FeedCommentUseCase feedCommentUseCase;

    @Mock private ClientIdentifierResolver clientIdentifierResolver;

    @Mock private HttpServletRequest httpServletRequest;

    @InjectMocks private FeedCommentController feedCommentController;

    @Test
    @DisplayName("시나리오: 비로그인 방문자의 댓글 좋아요는 클라이언트 식별자로 처리되고 누른 상태로 응답한다")
    void toggleLikeUsesClientIdentifierWhenNotLoggedIn() {
        when(clientIdentifierResolver.resolve(httpServletRequest)).thenReturn("1.2.3.4|ab12");
        when(feedCommentUseCase.toggleLike("feed-1", "comment-1", "1.2.3.4|ab12"))
                .thenReturn(likedComment("1.2.3.4|ab12"));

        ResponseEntity<ApiResponse<FeedCommentResponse>> response =
                feedCommentController.toggleLike("feed-1", "comment-1", null, httpServletRequest);

        FeedCommentResponse body = response.getBody().getData();
        assertThat(body.getIsLiked()).isTrue();
        assertThat(body.getLikesCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("시나리오: 로그인 사용자의 댓글 좋아요는 IP 대신 사용자 아이디로 처리된다")
    void toggleLikeUsesUserIdWhenLoggedIn() {
        when(feedCommentUseCase.toggleLike("feed-1", "comment-1", "user-1"))
                .thenReturn(likedComment("user-1"));

        feedCommentController.toggleLike("feed-1", "comment-1", "user-1", httpServletRequest);

        verify(feedCommentUseCase).toggleLike("feed-1", "comment-1", "user-1");
        verify(clientIdentifierResolver, org.mockito.Mockito.never()).resolve(httpServletRequest);
    }

    private FeedComment likedComment(String identifier) {
        return FeedComment.builder()
                .id("comment-1")
                .feedId("feed-1")
                .authorName("김승찬")
                .content("좋은 글이네요")
                .likedBy(Set.of(identifier))
                .likesCount(1)
                .build();
    }
}
