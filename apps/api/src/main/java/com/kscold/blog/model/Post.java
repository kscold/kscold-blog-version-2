package com.kscold.blog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
public class Post {
    @Id
    private String id;

    @TextIndexed
    private String title;

    @Indexed(unique = true)
    private String slug;

    @TextIndexed
    private String content; // Markdown

    private String excerpt; // 발췌문 (200자)

    private String coverImage;

    private CategoryInfo category;

    @Builder.Default
    private List<TagInfo> tags = new ArrayList<>();

    private AuthorInfo author;

    @Builder.Default
    private Status status = Status.DRAFT;

    @Builder.Default
    private Boolean featured = false;

    @Builder.Default
    private Integer views = 0;

    @Builder.Default
    private Integer likes = 0;

    private SeoInfo seo;

    private LocalDateTime publishedAt;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Status {
        DRAFT, PUBLISHED, ARCHIVED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private String id;
        private String name;
        private String slug;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private String id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeoInfo {
        private String metaTitle;
        private String metaDescription;
        private List<String> keywords;
    }
}
