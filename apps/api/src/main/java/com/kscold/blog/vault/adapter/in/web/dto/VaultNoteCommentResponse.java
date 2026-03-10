package com.kscold.blog.vault.adapter.in.web.dto;

import com.kscold.blog.vault.domain.model.VaultNoteComment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VaultNoteCommentResponse {

    private String id;
    private String noteId;
    private String authorName;
    private Boolean isAdmin;
    private String content;
    private LocalDateTime createdAt;

    public static VaultNoteCommentResponse from(VaultNoteComment c) {
        return VaultNoteCommentResponse.builder()
                .id(c.getId())
                .noteId(c.getNoteId())
                .authorName(c.getAuthorName())
                .isAdmin(c.getUserId() != null)
                .content(c.getContent())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
