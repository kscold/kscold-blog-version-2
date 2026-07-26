package com.kscold.blog.exception;

import java.io.EOFException;
import java.util.Locale;

/**
 * 실제 운영 장애만 오류 알림으로 보내기 위한 분류 정책.
 *
 * <p>브라우저가 SSE 응답이나 긴 요청을 중간에 닫으면 톰캣은 broken pipe, connection reset 같은 예외를 남긴다.
 * 서버가 처리하지 못한 오류가 아니므로 디스코드 알림을 보내지 않아 알림 채널의 신호 대 잡음 비율을 유지한다.
 */
final class ErrorAlertPolicy {

    private static final int MAX_CAUSE_DEPTH = 12;

    private ErrorAlertPolicy() {}

    static boolean shouldNotify(Exception exception) {
        Throwable current = exception;
        int depth = 0;

        while (current != null && depth < MAX_CAUSE_DEPTH) {
            if (isClientDisconnect(current)) {
                return false;
            }
            current = current.getCause();
            depth++;
        }

        return true;
    }

    private static boolean isClientDisconnect(Throwable throwable) {
        if (throwable instanceof EOFException) {
            return true;
        }

        String typeName = throwable.getClass().getSimpleName();
        if ("AsyncRequestNotUsableException".equals(typeName)
                || "ClientAbortException".equals(typeName)) {
            return true;
        }

        String message = throwable.getMessage();
        if (message == null) {
            return false;
        }

        String normalized = message.toLowerCase(Locale.ROOT);
        return normalized.contains("broken pipe")
                || normalized.contains("connection reset by peer")
                || normalized.contains("connection aborted")
                || normalized.contains("clientabortexception");
    }
}
