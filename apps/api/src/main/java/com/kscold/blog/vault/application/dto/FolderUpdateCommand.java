package com.kscold.blog.vault.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FolderUpdateCommand {

    @NotBlank(message = "폴더 이름은 필수입니다")
    private String name;

    private String slug;

    private Integer order;
}
