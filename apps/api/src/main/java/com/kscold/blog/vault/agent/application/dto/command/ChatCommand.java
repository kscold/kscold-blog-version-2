package com.kscold.blog.vault.agent.application.dto.command;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatCommand {

    @NotBlank(message = "질문을 입력해주세요.")
    @Size(max = 1200, message = "질문은 1200자 이하로 입력해주세요.")
    private String message;

    private String activeFolderName;

    @Size(max = 80, message = "세션 값이 너무 깁니다.")
    private String sessionId;
}
