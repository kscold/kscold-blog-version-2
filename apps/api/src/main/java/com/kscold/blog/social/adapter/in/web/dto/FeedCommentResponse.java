package com.kscold.blog.social.adapter.in.web.dto;

import com.kscold.blog.social.domain.model.FeedComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

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

    public static FeedCommentResponse from(FeedComment comment, String currentUserId, boolean currentUserIsAdmin) {
        boolean canDelete = currentUserId != null
                && (currentUserIsAdmin || currentUserId.equals(comment.getUserId()));

        return FeedCommentResponse.builder()
                .id(comment.getId())
                .feedId(comment.getFeedId())
                .authorName(comment.getAuthorName())
                .isAdmin(comment.getAuthorRole() == com.kscold.blog.identity.domain.model.User.Role.ADMIN)
                .canDelete(canDelete)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static List<FeedCommentResponse> from(List<FeedComment> comments, String currentUserId, boolean currentUserIsAdmin) {
        return comments.stream()
                .map(comment -> from(comment, currentUserId, currentUserIsAdmin))
                .toList();
    }
}
