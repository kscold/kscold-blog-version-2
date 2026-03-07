package com.kscold.blog.blog.application.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 카테고리 이동 커맨드 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryMoveCommand {

    private String newParentId;
}
