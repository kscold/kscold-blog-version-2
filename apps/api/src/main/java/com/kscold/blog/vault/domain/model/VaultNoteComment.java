package com.kscold.blog.vault.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "vault_note_comments")
public class VaultNoteComment {

    @Id
    private String id;

    @Indexed
    private String noteId;

    private String authorName;

    private String authorPassword;

    private String userId;

    private String content;

    @CreatedDate
    private LocalDateTime createdAt;
}
