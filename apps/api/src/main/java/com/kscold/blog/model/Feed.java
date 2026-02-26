package com.kscold.blog.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "feeds")
public class Feed {

    @Id
    private String id;

    private String content;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    private AuthorInfo author;

    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    private LinkPreview linkPreview;

    @Builder.Default
    private Set<String> likedBy = new HashSet<>();

    @Builder.Default
    private Integer likesCount = 0;

    @Builder.Default
    private Integer commentsCount = 0;

    @Builder.Default
    private Integer views = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum Visibility {
        PUBLIC, PRIVATE
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
        private String avatar;
    }

    @Data
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
