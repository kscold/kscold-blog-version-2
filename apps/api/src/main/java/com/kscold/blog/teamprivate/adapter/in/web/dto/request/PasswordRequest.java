package com.kscold.blog.teamprivate.adapter.in.web.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PasswordRequest {
    @Size(max = 256, message = "비밀번호가 너무 깁니다")
    private String password;

    @Size(max = 64, message = "팀 식별자가 너무 깁니다")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "팀 식별자 형식이 올바르지 않습니다")
    private String teamId;
}
