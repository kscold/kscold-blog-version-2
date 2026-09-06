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
    // 공개 목록의 허용 정렬을 고유 식별자로 안정화하고 필터 뒤 정렬까지 인덱스로 처리한다.
    @CompoundIndex(
            name = "idx_status_publishedAt_id_v2",
            def = "{'status': 1, 'publishedAt': -1, '_id': -1}"),
    @CompoundIndex(
            name = "idx_status_createdAt_id_v2",
            def = "{'status': 1, 'createdAt': -1, '_id': -1}"),
    @CompoundIndex(
            name = "idx_status_updatedAt_id_v2",
            def = "{'status': 1, 'updatedAt': -1, '_id': -1}"),
    @CompoundIndex(name = "idx_status_views_id_v2", def = "{'status': 1, 'views': -1, '_id': -1}"),
    // 카테고리·태그의 중첩 식별자는 실제 BSON 필드명인 _id를 사용한다.
    @CompoundIndex(
            name = "idx_category_status_publishedAt_id_v2",
            def = "{'category._id': 1, 'status': 1, 'publishedAt': -1, '_id': -1}"),
    @CompoundIndex(
            name = "idx_tags_status_publishedAt_id_v2",
            def = "{'tags._id': 1, 'status': 1, 'publishedAt': -1, '_id': -1}"),
    // 관리자 목록은 상태를 제한하지 않으므로 별도의 생성일 정렬 인덱스를 사용한다.
    @CompoundIndex(name = "idx_createdAt_id_v2", def = "{'createdAt': -1, '_id': -1}")
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
