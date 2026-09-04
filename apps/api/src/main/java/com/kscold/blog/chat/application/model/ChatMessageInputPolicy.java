package com.kscold.blog.chat.application.model;

import com.kscold.blog.exception.InvalidRequestException;
import org.springframework.util.StringUtils;

public final class ChatMessageInputPolicy {

    public static final int CONTENT_MAX_LENGTH = 1000;
    public static final String CONTENT_MAX_LENGTH_MESSAGE = "메시지는 최대 1000자입니다";

    private ChatMessageInputPolicy() {}

    public static String normalizeContent(String content) {
        if (!StringUtils.hasText(content)) {
            throw InvalidRequestException.missingInput("content");
        }

        String normalized = content.trim();
        if (normalized.length() > CONTENT_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput(CONTENT_MAX_LENGTH_MESSAGE);
        }
        return normalized;
    }
}
