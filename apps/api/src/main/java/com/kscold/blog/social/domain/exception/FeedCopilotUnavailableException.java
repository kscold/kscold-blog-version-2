package com.kscold.blog.social.domain.exception;

/** 피드 초안 생성 Agent를 현재 사용할 수 없을 때 발생합니다. */
public class FeedCopilotUnavailableException extends RuntimeException {

    public FeedCopilotUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
