package com.kscold.blog.identity.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenCommand {

    @NotBlank(message = "리프레시 토큰은 필수입니다")
    private String refreshToken;
}
