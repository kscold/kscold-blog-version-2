package com.kscold.blog.exception;

import com.kscold.blog.shared.web.ApiResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** 상태 코드만 알 수 있는 오류(서블릿 컨테이너가 거절한 요청, 프레임워크가 4xx 로 정해 둔 요청 오류)를 표준 오류 형식으로 만든다. */
public final class StatusErrorResponse {

    private StatusErrorResponse() {}

    public static ResponseEntity<ApiResponse<Void>> of(HttpStatusCode status) {
        return of(status, HttpHeaders.EMPTY);
    }

    /**
     * @param hints 허용되는 요청 방식·형식처럼, 요청을 고쳐 다시 보낼 수 있게 프레임워크가 함께 알려 주는 헤더
     */
    public static ResponseEntity<ApiResponse<Void>> of(HttpStatusCode status, HttpHeaders hints) {
        Description description = describe(status);
        // 응답 형식을 정해 두지 않으면, JSON 을 받지 않겠다는 요청에는 오류 본문을 쓰지 못해 다시 오류가 난다.
        return ResponseEntity.status(status)
                .headers(hints)
                .contentType(MediaType.APPLICATION_JSON)
                .body(ApiResponse.error(description.code().getCode(), description.message()));
    }

    private static Description describe(HttpStatusCode status) {
        if (!status.is4xxClientError()) {
            return new Description(
                    ErrorCode.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        return switch (status.value()) {
            case 401 -> new Description(ErrorCode.UNAUTHORIZED, "인증이 필요합니다. 다시 로그인해주세요.");
            case 403 -> new Description(ErrorCode.FORBIDDEN, "접근 권한이 없습니다.");
            case 404 -> new Description(ErrorCode.RESOURCE_NOT_FOUND, "요청한 리소스를 찾을 수 없습니다.");
            case 405 -> new Description(ErrorCode.METHOD_NOT_ALLOWED, "지원하지 않는 요청 방식입니다.");
            case 406 -> new Description(ErrorCode.INVALID_INPUT_VALUE, "요청한 응답 형식을 지원하지 않습니다.");
            case 413 -> new Description(ErrorCode.INVALID_INPUT_VALUE, "요청 크기가 허용 범위를 넘었습니다.");
            case 415 -> new Description(ErrorCode.INVALID_INPUT_VALUE, "지원하지 않는 요청 본문 형식입니다.");
            case 429 ->
                    new Description(ErrorCode.RATE_LIMIT_EXCEEDED, "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
            default -> new Description(ErrorCode.INVALID_INPUT_VALUE, "잘못된 요청입니다.");
        };
    }

    private record Description(ErrorCode code, String message) {}
}
