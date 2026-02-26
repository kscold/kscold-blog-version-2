package com.kscold.blog.dto.response;

import com.kscold.blog.model.Feed;
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
public class FeedResponse {

    private String id;
    private String content;
    private List<String> images;
    private AuthorInfo author;
    private Feed.Visibility visibility;
    private LinkPreviewInfo linkPreview;
    private Integer likesCount;
    private Integer commentsCount;
    private Integer views;
    private Boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
        private String avatar;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkPreviewInfo {
        private String url;
        private String title;
        private String description;
        private String image;
        private String siteName;
    }

    public static FeedResponse from(Feed feed) {
        return from(feed, null);
    }

    public static FeedResponse from(Feed feed, String requestIdentifier) {
        boolean liked = requestIdentifier != null && feed.getLikedBy().contains(requestIdentifier);

        return FeedResponse.builder()
                .id(feed.getId())
                .content(feed.getContent())
                .images(feed.getImages())
                .author(feed.getAuthor() != null ? AuthorInfo.builder()
                        .id(feed.getAuthor().getId())
                        .name(feed.getAuthor().getName())
                        .avatar(feed.getAuthor().getAvatar())
                        .build() : null)
                .visibility(feed.getVisibility())
                .linkPreview(feed.getLinkPreview() != null ? LinkPreviewInfo.builder()
                        .url(feed.getLinkPreview().getUrl())
                        .title(feed.getLinkPreview().getTitle())
                        .description(feed.getLinkPreview().getDescription())
                        .image(feed.getLinkPreview().getImage())
                        .siteName(feed.getLinkPreview().getSiteName())
                        .build() : null)
                .likesCount(feed.getLikesCount())
                .commentsCount(feed.getCommentsCount())
                .views(feed.getViews())
                .isLiked(liked)
                .createdAt(feed.getCreatedAt())
                .updatedAt(feed.getUpdatedAt())
                .build();
    }
}
