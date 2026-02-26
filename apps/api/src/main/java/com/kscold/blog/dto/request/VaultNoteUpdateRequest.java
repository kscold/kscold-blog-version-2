package com.kscold.blog.dto.request;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VaultNoteUpdateRequest {

    private String title;

    private String slug;

    private String content;

    private String folderId;

    private List<String> tags;
}
