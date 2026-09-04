package com.kscold.blog.social.adapter.in.web.dto.response;

import com.kscold.blog.social.domain.model.FeedComment;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedCommentResponse {

    private String id;
    private String feedId;
    private String authorName;
    private Boolean isAdmin;
    private Boolean canDelete;
    private String content;
    private LocalDateTime createdAt;
    private Integer likesCount;

    /** 보고 있는 사람이 이미 좋아요를 눌렀는지. 비로그인도 클라이언트 식별자로 판별한다. */
    private Boolean isLiked;

    public static FeedCommentResponse from(
            FeedComment comment,
            String currentUserId,
            boolean currentUserIsAdmin,
            String likeIdentifier) {
        boolean canDelete =
                currentUserId != null
                        && (currentUserIsAdmin || currentUserId.equals(comment.getUserId()));

        return FeedCommentResponse.builder()
                .id(comment.getId())
                .feedId(comment.getFeedId())
                .authorName(comment.getAuthorName())
                .isAdmin(
                        comment.getAuthorRole()
                                == com.kscold.blog.identity.domain.model.User.Role.ADMIN)
                .canDelete(canDelete)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .likesCount(comment.getLikesCount() == null ? 0 : comment.getLikesCount())
                .isLiked(
                        likeIdentifier != null
                                && comment.getLikedBy() != null
                                && comment.getLikedBy().contains(likeIdentifier))
                .build();
    }

    public static List<FeedCommentResponse> from(
            List<FeedComment> comments,
            String currentUserId,
            boolean currentUserIsAdmin,
            String likeIdentifier) {
        return comments.stream()
                .map(comment -> from(comment, currentUserId, currentUserIsAdmin, likeIdentifier))
                .toList();
    }
}
