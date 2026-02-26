package com.kscold.blog.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VaultFolderCreateRequest {

    @NotBlank(message = "폴더 이름은 필수입니다")
    private String name;

    private String slug;

    private String parent;

    private Integer order = 0;
}
