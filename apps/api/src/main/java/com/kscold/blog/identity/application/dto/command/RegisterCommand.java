package com.kscold.blog.identity.application.dto.command;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RegisterCommand {
    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    @Size(max = 254, message = "이메일은 최대 254자여야 합니다")
    private String email;

    @NotBlank(message = "사용자명은 필수입니다")
    @Size(min = 3, max = 20, message = "사용자명은 3-20자여야 합니다")
    @Pattern(regexp = "^[a-z0-9_]+$", message = "사용자명은 영문 소문자, 숫자, 밑줄만 사용할 수 있습니다")
    private String username;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 72, message = "비밀번호는 8-72자여야 합니다")
    private String password;

    @Size(max = 30, message = "표시 이름은 최대 30자여야 합니다")
    private String displayName;
}
