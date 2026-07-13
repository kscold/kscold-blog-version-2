package com.kscold.blog.vault.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class FolderCreateCommand {

    @NotBlank(message = "폴더 이름은 필수입니다")
    private String name;

    private String slug;

    private String parent;

    @Builder.Default private Integer order = 0;
}
