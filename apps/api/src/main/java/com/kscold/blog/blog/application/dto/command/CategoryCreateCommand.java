package com.kscold.blog.blog.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 카테고리 생성 커맨드 DTO */
@Getter
@Builder
@AllArgsConstructor
public class CategoryCreateCommand {

    @NotBlank(message = "카테고리 이름은 필수입니다")
    private String name;

    private String slug;

    private String description;

    private String parent;

    @Builder.Default private Integer order = 0;

    private String icon;

    private String color;
}
