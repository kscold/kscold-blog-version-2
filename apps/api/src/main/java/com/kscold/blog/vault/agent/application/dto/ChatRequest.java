package com.kscold.blog.vault.agent.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequest(
        @NotBlank(message = "질문을 입력해주세요.") @Size(max = 1200, message = "질문은 1200자 이하로 입력해주세요.")
                String message,
        String activeFolderName,
        @Size(max = 80, message = "세션 값이 너무 깁니다.") String sessionId) {}
