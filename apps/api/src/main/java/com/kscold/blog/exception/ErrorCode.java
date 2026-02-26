package com.kscold.blog.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * API 에러 코드 정의
 * HTTP 상태 코드와 매핑하여 일관된 에러 응답 제공
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "E001", "잘못된 입력값입니다"),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "E002", "잘못된 타입입니다"),
    MISSING_INPUT_VALUE(HttpStatus.BAD_REQUEST, "E003", "필수 입력값이 누락되었습니다"),

    // 401 Unauthorized
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "E101", "인증이 필요합니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "E102", "유효하지 않은 토큰입니다"),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "E103", "만료된 토큰입니다"),

    // 403 Forbidden
    FORBIDDEN(HttpStatus.FORBIDDEN, "E201", "접근 권한이 없습니다"),

    // 404 Not Found
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "E301", "요청한 리소스를 찾을 수 없습니다"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "E302", "사용자를 찾을 수 없습니다"),
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "E303", "포스트를 찾을 수 없습니다"),
    CATEGORY_NOT_FOUND(HttpStatus.NOT_FOUND, "E304", "카테고리를 찾을 수 없습니다"),
    TAG_NOT_FOUND(HttpStatus.NOT_FOUND, "E305", "태그를 찾을 수 없습니다"),
    FEED_NOT_FOUND(HttpStatus.NOT_FOUND, "E306", "피드를 찾을 수 없습니다"),
    FEED_COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "E307", "댓글을 찾을 수 없습니다"),
    VAULT_NOTE_NOT_FOUND(HttpStatus.NOT_FOUND, "E308", "노트를 찾을 수 없습니다"),
    VAULT_FOLDER_NOT_FOUND(HttpStatus.NOT_FOUND, "E309", "폴더를 찾을 수 없습니다"),
    VAULT_COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "E310", "댓글을 찾을 수 없습니다"),

    // 409 Conflict
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "E401", "이미 존재하는 리소스입니다"),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "E402", "이미 사용 중인 이메일입니다"),
    DUPLICATE_USERNAME(HttpStatus.CONFLICT, "E403", "이미 사용 중인 사용자명입니다"),
    DUPLICATE_SLUG(HttpStatus.CONFLICT, "E404", "이미 사용 중인 슬러그입니다"),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E901", "서버 내부 오류가 발생했습니다"),
    DATABASE_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E902", "데이터베이스 오류가 발생했습니다"),
    EXTERNAL_API_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "E903", "외부 API 호출 중 오류가 발생했습니다");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
