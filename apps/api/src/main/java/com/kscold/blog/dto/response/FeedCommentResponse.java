package com.kscold.blog.dto.response;

import com.kscold.blog.model.FeedComment;
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
    private String content;
    private LocalDateTime createdAt;

    public static FeedCommentResponse from(FeedComment comment) {
        return FeedCommentResponse.builder()
                .id(comment.getId())
                .feedId(comment.getFeedId())
                .authorName(comment.getAuthorName())
                .isAdmin(comment.getUserId() != null)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    public static List<FeedCommentResponse> from(List<FeedComment> comments) {
        return comments.stream()
                .map(FeedCommentResponse::from)
                .toList();
    }
}
