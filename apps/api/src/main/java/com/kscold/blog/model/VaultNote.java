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
@Document(collection = "vault_notes")
public class VaultNote {

    @Id
    private String id;

    @TextIndexed
    private String title;

    @Indexed(unique = true)
    private String slug;

    @TextIndexed
    private String content;

    private String folderId;

    private AuthorInfo author;

    @Builder.Default
    private List<String> outgoingLinks = new ArrayList<>();

    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @Builder.Default
    private Integer views = 0;

    @Builder.Default
    private Integer commentsCount = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }
}
