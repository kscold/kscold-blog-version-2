package com.kscold.blog.identity.application.dto;

import java.time.Instant;

public record PasswordResetTokenStatus(
        boolean valid,
        String message,
        Instant expiresAt
) {
}
