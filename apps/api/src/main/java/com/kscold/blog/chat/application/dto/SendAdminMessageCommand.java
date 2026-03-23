package com.kscold.blog.chat.application.dto;

import jakarta.validation.constraints.NotBlank;

public record SendAdminMessageCommand(
        @NotBlank String content,
        String username
) {
    public String resolvedUsername() {
        return username != null && !username.isBlank() ? username : "관리자";
    }
}
