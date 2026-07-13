package com.kscold.blog.blog.adapter.in.web.dto.response;

import com.kscold.blog.blog.domain.model.Post;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 포스트 응답 DTO */
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
    private Boolean publicOverride;
    private Boolean restricted;
    private Integer views;
    private Integer likes;
    private SeoInfo seo;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /** 카테고리 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private String id;
        private String name;
        private String slug;
    }

    /** 태그 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private String id;
        private String name;
    }

    /** 작성자 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }

    /** SEO 정보 */
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeoInfo {
        private String metaTitle;
        private String metaDescription;
        private List<String> keywords;
    }

    /** Post 엔티티를 PostResponse로 변환 */
    public static PostResponse from(Post post) {
        return from(post, false);
    }

    /** Post 엔티티를 PostResponse로 변환하고, 제한 글 표시 여부를 함께 전달 */
    public static PostResponse from(Post post, boolean restricted) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .content(post.getContent())
                .excerpt(post.getExcerpt())
                .coverImage(post.getCoverImage())
                .category(
                        post.getCategory() != null
                                ? CategoryInfo.builder()
                                        .id(post.getCategory().getId())
                                        .name(post.getCategory().getName())
                                        .slug(post.getCategory().getSlug())
                                        .build()
                                : null)
                .tags(
                        post.getTags() != null
                                ? post.getTags().stream()
                                        .map(
                                                tag ->
                                                        TagInfo.builder()
                                                                .id(tag.getId())
                                                                .name(tag.getName())
                                                                .build())
                                        .toList()
                                : null)
                .author(
                        post.getAuthor() != null
                                ? AuthorInfo.builder()
                                        .id(post.getAuthor().getId())
                                        .name(post.getAuthor().getName())
                                        .build()
                                : null)
                .status(post.getStatus())
                .source(post.getSource())
                .originalFilename(post.getOriginalFilename())
                .featured(post.getFeatured())
                .publicOverride(post.getPublicOverride())
                .restricted(restricted ? true : null)
                .views(post.getViews())
                .likes(post.getLikes())
                .seo(
                        post.getSeo() != null
                                ? SeoInfo.builder()
                                        .metaTitle(post.getSeo().getMetaTitle())
                                        .metaDescription(post.getSeo().getMetaDescription())
                                        .keywords(post.getSeo().getKeywords())
                                        .build()
                                : null)
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    /** restricted 포스트 — 본문 제거, excerpt만 반환 */
    public static PostResponse restricted(Post post) {
        PostResponse resp = from(post, true);
        return PostResponse.builder()
                .id(resp.getId())
                .title(resp.getTitle())
                .slug(resp.getSlug())
                .content(null)
                .excerpt(resp.getExcerpt())
                .coverImage(resp.getCoverImage())
                .category(resp.getCategory())
                .tags(resp.getTags())
                .author(resp.getAuthor())
                .status(resp.getStatus())
                .source(resp.getSource())
                .featured(resp.getFeatured())
                .publicOverride(resp.getPublicOverride())
                .restricted(true)
                .views(resp.getViews())
                .likes(resp.getLikes())
                .seo(resp.getSeo())
                .publishedAt(resp.getPublishedAt())
                .createdAt(resp.getCreatedAt())
                .updatedAt(resp.getUpdatedAt())
                .build();
    }

    /** Post 리스트를 PostResponse 리스트로 변환 */
    public static List<PostResponse> from(List<Post> posts) {
        return posts.stream().map(PostResponse::from).toList();
    }
}
