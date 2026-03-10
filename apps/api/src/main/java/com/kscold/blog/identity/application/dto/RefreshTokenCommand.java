package com.kscold.blog.identity.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenCommand {

    @NotBlank(message = "리프레시 토큰은 필수입니다")
    private String refreshToken;
}
