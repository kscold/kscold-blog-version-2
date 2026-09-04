package com.kscold.blog.blog.adapter.in.web.dto.request;

import com.kscold.blog.blog.application.model.AccessRequestInputPolicy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

/** 접근 요청 생성 DTO */
@Getter
@Builder
@AllArgsConstructor
public class CreateAccessRequest {

    @NotBlank(message = "글 식별자는 필수입니다")
    @Size(
            max = AccessRequestInputPolicy.POST_ID_MAX_LENGTH,
            message = AccessRequestInputPolicy.POST_ID_MAX_LENGTH_MESSAGE)
    private String postId;

    @Size(
            max = AccessRequestInputPolicy.MESSAGE_MAX_LENGTH,
            message = AccessRequestInputPolicy.MESSAGE_MAX_LENGTH_MESSAGE)
    private String message;
}
