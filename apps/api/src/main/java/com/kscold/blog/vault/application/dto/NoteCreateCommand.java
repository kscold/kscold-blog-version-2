package com.kscold.blog.vault.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteCreateCommand {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String slug;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @NotBlank(message = "폴더는 필수입니다")
    private String folderId;

    private List<String> tags;
}
