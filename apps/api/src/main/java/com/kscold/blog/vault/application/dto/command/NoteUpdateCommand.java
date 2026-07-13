package com.kscold.blog.vault.application.dto.command;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class NoteUpdateCommand {

    private String title;

    private String slug;

    private String content;

    private String folderId;

    private List<String> tags;
}
