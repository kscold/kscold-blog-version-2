package com.kscold.blog.social.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DeleteCommentCommand {

    @NotBlank(message = "비밀번호는 필수입니다")
    private String password;
}
