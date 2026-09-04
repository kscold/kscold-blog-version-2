package com.kscold.blog.blog.application.model;

import com.kscold.blog.exception.InvalidRequestException;
import org.springframework.lang.Nullable;
import org.springframework.util.StringUtils;

public final class AccessRequestInputPolicy {

    public static final int POST_ID_MAX_LENGTH = 128;
    public static final int MESSAGE_MAX_LENGTH = 500;
    public static final String POST_ID_MAX_LENGTH_MESSAGE = "글 식별자가 너무 깁니다";
    public static final String MESSAGE_MAX_LENGTH_MESSAGE = "요청 메시지는 최대 500자입니다";

    private AccessRequestInputPolicy() {}

    public static String normalizePostId(String postId) {
        if (!StringUtils.hasText(postId)) {
            throw InvalidRequestException.missingInput("postId");
        }

        String normalized = postId.trim();
        if (normalized.length() > POST_ID_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput(POST_ID_MAX_LENGTH_MESSAGE);
        }
        return normalized;
    }

    @Nullable
    public static String normalizeMessage(@Nullable String message) {
        if (!StringUtils.hasText(message)) {
            return null;
        }

        String normalized = message.trim();
        if (normalized.length() > MESSAGE_MAX_LENGTH) {
            throw InvalidRequestException.invalidInput(MESSAGE_MAX_LENGTH_MESSAGE);
        }
        return normalized;
    }
}
