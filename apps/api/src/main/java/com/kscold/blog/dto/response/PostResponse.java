package com.kscold.blog.dto.response;

import com.kscold.blog.model.Post;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 포스트 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private String id;
    private String title;
    private String slug;
    private String content;
    private String excerpt;
    private String coverImage;
    private CategoryInfo category;
    private List<TagInfo> tags;
    private AuthorInfo author;
    private Post.Status status;
    private Post.Source source;
    private String originalFilename;
    private Boolean featured;
    private Integer views;
    private Integer likes;
    private SeoInfo seo;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 카테고리 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private String id;
        private String name;
        private String slug;
    }

    /**
     * 태그 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private String id;
        private String name;
    }

    /**
     * 작성자 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }

    /**
     * SEO 정보
     */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeoInfo {
        private String metaTitle;
        private String metaDescription;
        private List<String> keywords;
    }

    /**
     * Post 엔티티를 PostResponse로 변환
     */
    public static PostResponse from(Post post) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .excerpt(post.getExcerpt())
                .coverImage(post.getCoverImage())
                .category(CategoryInfo.builder()
                        .id(post.getCategory().getId())
                        .name(post.getCategory().getName())
                        .slug(post.getCategory().getSlug())
                        .build())
                .tags(post.getTags() != null ? post.getTags().stream()
                        .map(tag -> TagInfo.builder()
                                .id(tag.getId())
                                .name(tag.getName())
                                .build())
                        .toList() : null)
                .author(AuthorInfo.builder()
                        .id(post.getAuthor().getId())
                        .name(post.getAuthor().getName())
                        .build())
                .status(post.getStatus())
                .source(post.getSource())
                .originalFilename(post.getOriginalFilename())
                .featured(post.getFeatured())
                .views(post.getViews())
                .likes(post.getLikes())
                .seo(post.getSeo() != null ? SeoInfo.builder()
                        .metaTitle(post.getSeo().getMetaTitle())
                        .metaDescription(post.getSeo().getMetaDescription())
                        .keywords(post.getSeo().getKeywords())
                        .build() : null)
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    /**
     * Post 리스트를 PostResponse 리스트로 변환
     */
    public static List<PostResponse> from(List<Post> posts) {
        return posts.stream()
                .map(PostResponse::from)
                .toList();
    }
}
