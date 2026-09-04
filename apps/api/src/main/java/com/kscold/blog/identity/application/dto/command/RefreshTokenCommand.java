package com.kscold.blog.identity.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RefreshTokenCommand {

    @NotBlank(message = "리프레시 토큰은 필수입니다")
    @Size(max = 2048, message = "리프레시 토큰이 너무 깁니다")
    private String refreshToken;
}
