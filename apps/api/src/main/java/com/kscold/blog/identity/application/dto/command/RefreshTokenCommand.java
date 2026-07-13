package com.kscold.blog.identity.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class RefreshTokenCommand {

    @NotBlank(message = "리프레시 토큰은 필수입니다")
    private String refreshToken;
}
