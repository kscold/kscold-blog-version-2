package com.kscold.blog.identity.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ResetPasswordCommand {

    public static final int MAX_TOKEN_LENGTH = 256;

    @NotBlank(message = "토큰은 필수입니다")
    @Size(max = MAX_TOKEN_LENGTH, message = "토큰이 너무 깁니다")
    private String token;

    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 8, max = 72, message = "비밀번호는 8-72자여야 합니다")
    private String newPassword;
}
