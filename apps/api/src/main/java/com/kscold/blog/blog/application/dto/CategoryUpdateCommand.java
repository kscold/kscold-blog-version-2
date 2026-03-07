package com.kscold.blog.blog.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 카테고리 수정 커맨드 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateCommand {

    @NotBlank(message = "카테고리 이름은 필수입니다")
    private String name;

    private String slug;

    private String description;

    private Integer order;

    private String icon;

    private String color;
}
