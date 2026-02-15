package com.kscold.blog.exception;

/**
 * 리소스 중복 시 발생하는 예외
 * HTTP 409 Conflict 응답
 */
public class DuplicateResourceException extends BusinessException {

    public DuplicateResourceException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DuplicateResourceException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }

    public static DuplicateResourceException email(String email) {
        return new DuplicateResourceException(
            ErrorCode.DUPLICATE_EMAIL,
            String.format("이미 사용 중인 이메일입니다 (%s)", email)
        );
    }

    public static DuplicateResourceException username(String username) {
        return new DuplicateResourceException(
            ErrorCode.DUPLICATE_USERNAME,
            String.format("이미 사용 중인 사용자명입니다 (%s)", username)
        );
    }

    public static DuplicateResourceException slug(String slug) {
        return new DuplicateResourceException(
            ErrorCode.DUPLICATE_SLUG,
            String.format("이미 사용 중인 슬러그입니다 (%s)", slug)
        );
    }
}
