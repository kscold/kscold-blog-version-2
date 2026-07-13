package com.kscold.blog.social.adapter.in.web.dto.response;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.social.domain.model.Feed;
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
public class FeedResponse {

    private String id;
    private String content;
    private List<String> images;
    private List<String> tags;
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
        private String username;
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
                .tags(feed.getTags())
                .author(
                        feed.getAuthor() != null
                                ? AuthorInfo.builder()
                                        .id(feed.getAuthor().getId())
                                        .username(feed.getAuthor().getUsername())
                                        .name(feed.getAuthor().getName())
                                        .avatar(feed.getAuthor().getAvatar())
                                        .build()
                                : null)
                .visibility(feed.getVisibility())
                .linkPreview(
                        feed.getLinkPreview() != null
                                ? LinkPreviewInfo.builder()
                                        .url(feed.getLinkPreview().getUrl())
                                        .title(feed.getLinkPreview().getTitle())
                                        .description(feed.getLinkPreview().getDescription())
                                        .image(feed.getLinkPreview().getImage())
                                        .siteName(feed.getLinkPreview().getSiteName())
                                        .build()
                                : null)
                .likesCount(feed.getLikesCount())
                .commentsCount(feed.getCommentsCount())
                .views(feed.getViews())
                .isLiked(liked)
                .createdAt(feed.getCreatedAt())
                .updatedAt(feed.getUpdatedAt())
                .build();
    }

    /**
     * 작성자 최신 프로필(avatar·표시 이름)을 실시간으로 채워서 응답을 만든다. feed.author 는 작성 시점 스냅샷({id, name})이라 프로필 이미지가
     * 빠져 있으므로, 조회 시점에 사용자 정보를 주입해 항상 최신 프로필이 보이도록 한다.
     */
    public static FeedResponse from(
            Feed feed, String requestIdentifier, UserQueryPort.UserInfo authorInfo) {
        FeedResponse response = from(feed, requestIdentifier);
        if (authorInfo != null) {
            String displayName =
                    authorInfo.displayName() != null && !authorInfo.displayName().isBlank()
                            ? authorInfo.displayName()
                            : authorInfo.username();
            response.author =
                    AuthorInfo.builder()
                            .id(authorInfo.id())
                            .username(authorInfo.username())
                            .name(displayName)
                            .avatar(authorInfo.avatar())
                            .build();
        }
        return response;
    }
}
