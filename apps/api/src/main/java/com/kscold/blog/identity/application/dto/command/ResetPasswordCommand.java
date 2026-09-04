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

    @NotBlank(message = "토큰은 필수입니다")
    @Size(max = 256, message = "토큰이 너무 깁니다")
    private String token;

    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 8, max = 72, message = "비밀번호는 8-72자여야 합니다")
    private String newPassword;
}
