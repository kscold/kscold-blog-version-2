package com.kscold.blog.blog.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
@CompoundIndexes({
    // 공개 글 목록의 기본 정렬과 인기 글 조회가 컬렉션 전체 스캔으로 커지지 않게 한다.
    @CompoundIndex(name = "idx_status_publishedAt", def = "{'status': 1, 'publishedAt': -1}"),
    @CompoundIndex(name = "idx_status_views", def = "{'status': 1, 'views': -1}"),
    // 카테고리·태그 아카이브의 공개 글 필터와 발행일 정렬을 함께 지원한다.
    @CompoundIndex(
            name = "idx_category_status_publishedAt",
            def = "{'category.id': 1, 'status': 1, 'publishedAt': -1}"),
    @CompoundIndex(
            name = "idx_tags_status_publishedAt",
            def = "{'tags.id': 1, 'status': 1, 'publishedAt': -1}")
})
public class Post {
    @Id private String id;

    @TextIndexed private String title;

    @Indexed(unique = true)
    private String slug;

    @TextIndexed private String content; // 마크다운 본문

    private String excerpt; // 발췌문 (200자)

    private String coverImage;

    private CategoryInfo category;

    @Builder.Default private List<TagInfo> tags = new ArrayList<>();

    private AuthorInfo author;

    @Builder.Default private Source source = Source.MANUAL;

    private String originalFilename;

    @Builder.Default private Status status = Status.DRAFT;

    @Builder.Default private Boolean featured = false;

    @Builder.Default private Boolean publicOverride = false;

    @Builder.Default private Integer views = 0;

    @Builder.Default private Integer likes = 0;

    private SeoInfo seo;

    private LocalDateTime publishedAt;

    @CreatedDate private LocalDateTime createdAt;

    @LastModifiedDate private LocalDateTime updatedAt;

    public enum Status {
        DRAFT,
        PUBLISHED,
        ARCHIVED
    }

    public enum Source {
        MANUAL,
        MARKDOWN_IMPORT
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private String id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagInfo {
        private String id;
        private String name;
        private String slug;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeoInfo {
        private String metaTitle;
        private String metaDescription;
        private List<String> keywords;
    }
}
