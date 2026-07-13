package com.kscold.blog.blog.adapter.in.web.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 접근 요청 생성 DTO */
@Getter
@Builder
@AllArgsConstructor
public class CreateAccessRequest {

    private String postId;
    private String message;
}
