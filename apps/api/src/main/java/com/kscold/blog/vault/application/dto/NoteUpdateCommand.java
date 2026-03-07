package com.kscold.blog.vault.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

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
