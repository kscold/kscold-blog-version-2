package com.kscold.blog.identity.application.dto.response;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PasswordResetTokenResponse {
    private boolean valid;
    private String message;
    private Instant expiresAt;
}
