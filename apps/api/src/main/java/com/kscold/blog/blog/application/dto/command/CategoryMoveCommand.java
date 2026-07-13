package com.kscold.blog.blog.application.dto.command;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 카테고리 이동 커맨드 DTO */
@Getter
@Builder
@AllArgsConstructor
public class CategoryMoveCommand {

    private String newParentId;
}
