package com.kscold.blog.social.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 인덱스는 실제 조회 쿼리(MongoFeedRepository)와 1:1로 맞춘다. /feed 메인 목록이 가장 트래픽이 많은 페이지라 인덱스 없이는 컬렉션이 커질수록 매
 * 요청마다 전체 스캔 + 인메모리 정렬이 발생하고, MongoDB 기본 정렬 메모리 한도(32MB)를 넘기면 오류가 난다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feeds")
@CompoundIndexes({
    // GET /feeds — findByVisibility(visibility, pageable) + createdAt DESC 정렬
    @CompoundIndex(name = "idx_visibility_createdAt", def = "{'visibility': 1, 'createdAt': -1}"),
    // GET /feeds?tag= — findByVisibilityAndTagsContaining(...) + createdAt DESC 정렬
    @CompoundIndex(
            name = "idx_visibility_tags_createdAt",
            def = "{'visibility': 1, 'tags': 1, 'createdAt': -1}"),
    // GET /users/{username}/feeds — findByAuthorIdAndVisibility(...) + createdAt DESC 정렬
    @CompoundIndex(
            name = "idx_author_visibility_createdAt",
            def = "{'author.id': 1, 'visibility': 1, 'createdAt': -1}")
})
public class Feed {

    @Id private String id;

    private String content;

    @Builder.Default private List<String> images = new ArrayList<>();

    private AuthorInfo author;

    @Builder.Default private Visibility visibility = Visibility.PUBLIC;

    private LinkPreview linkPreview;

    @Builder.Default private List<String> tags = new ArrayList<>();

    @Builder.Default private Set<String> likedBy = new HashSet<>();

    @Builder.Default private Integer likesCount = 0;

    @Builder.Default private Integer commentsCount = 0;

    @Builder.Default private Integer views = 0;

    @CreatedDate private LocalDateTime createdAt;

    @LastModifiedDate private LocalDateTime updatedAt;

    public enum Visibility {
        PUBLIC,
        PRIVATE
    }

    @Getter
    @Setter
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
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkPreview {
        private String url;
        private String title;
        private String description;
        private String image;
        private String siteName;
    }
}
