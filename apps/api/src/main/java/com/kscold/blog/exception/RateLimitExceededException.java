package com.kscold.blog.exception;

public class RateLimitExceededException extends BusinessException {

    public RateLimitExceededException(String message) {
        super(ErrorCode.RATE_LIMIT_EXCEEDED, message);
    }
}
