package com.kscold.blog.chat.application.dto.command;

import com.kscold.blog.chat.application.model.ChatMessageInputPolicy;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SendAdminMessageCommand {

    @NotBlank
    @Size(
            max = ChatMessageInputPolicy.CONTENT_MAX_LENGTH,
            message = ChatMessageInputPolicy.CONTENT_MAX_LENGTH_MESSAGE)
    private String content;

    private String username;

    public String resolvedUsername() {
        return username != null && !username.isBlank() ? username : "관리자";
    }
}
