package com.kscold.blog.blog.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 태그 생성/수정 커맨드 DTO */
@Getter
@Builder
@AllArgsConstructor
public class TagCommand {

    @NotBlank(message = "태그 이름은 필수입니다")
    private String name;

    private String slug;
}
