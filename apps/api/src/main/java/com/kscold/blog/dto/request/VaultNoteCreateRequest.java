package com.kscold.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VaultNoteCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    private String slug;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @NotBlank(message = "폴더는 필수입니다")
    private String folderId;

    private List<String> tags;
}
