package com.kscold.blog.chat.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SendAdminMessageCommand {

    @NotBlank private String content;

    private String username;

    public String resolvedUsername() {
        return username != null && !username.isBlank() ? username : "관리자";
    }
}
