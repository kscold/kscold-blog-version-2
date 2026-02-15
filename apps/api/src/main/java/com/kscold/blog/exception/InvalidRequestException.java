package com.kscold.blog.exception;

/**
 * 잘못된 요청 시 발생하는 예외
 * HTTP 400 Bad Request 응답
 */
public class InvalidRequestException extends BusinessException {

    public InvalidRequestException(ErrorCode errorCode) {
        super(errorCode);
    }

    public InvalidRequestException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static InvalidRequestException invalidInput(String message) {
        return new InvalidRequestException(
            ErrorCode.INVALID_INPUT_VALUE,
            message
        );
    }

    public static InvalidRequestException missingInput(String fieldName) {
        return new InvalidRequestException(
            ErrorCode.MISSING_INPUT_VALUE,
            String.format("필수 입력값이 누락되었습니다 (%s)", fieldName)
        );
    }
}
