package com.kscold.blog.vault.application.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteUpdateCommand {

    private String title;

    private String slug;

    private String content;

    private String folderId;

    private List<String> tags;
}
