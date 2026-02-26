package com.kscold.blog.dto.response;

import com.kscold.blog.model.VaultNote;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaultNoteResponse {

    private String id;
    private String title;
    private String slug;
    private String content;
    private String folderId;
    private AuthorInfo author;
    private List<String> outgoingLinks;
    private List<String> tags;
    private Integer views;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
    }

    public static VaultNoteResponse from(VaultNote note) {
        return VaultNoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .slug(note.getSlug())
                .content(note.getContent())
                .folderId(note.getFolderId())
                .author(note.getAuthor() != null ? AuthorInfo.builder()
                        .id(note.getAuthor().getId())
                        .name(note.getAuthor().getName())
                        .build() : null)
                .outgoingLinks(note.getOutgoingLinks())
                .tags(note.getTags())
                .views(note.getViews())
                .commentsCount(note.getCommentsCount())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
