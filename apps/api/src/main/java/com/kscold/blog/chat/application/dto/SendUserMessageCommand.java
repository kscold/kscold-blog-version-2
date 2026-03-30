package com.kscold.blog.chat.application.dto;

import jakarta.validation.constraints.NotBlank;

public record SendUserMessageCommand(
        @NotBlank String content
) {
}
