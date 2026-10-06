package com.kscold.blog.exception;

import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;

/** 예상치 못한 서버 오류를 디스코드 알림 채널로 알린다. 알림 실패가 응답을 방해하지 않도록 예외를 삼킨다. */
@Slf4j
final class ServerErrorAlert {

    private ServerErrorAlert() {}

    static void send(
            NotificationUseCase notifications,
            Exception exception,
            @Nullable HttpServletRequest request) {
        if (!ErrorAlertPolicy.shouldNotify(exception)) {
            log.debug("클라이언트 연결 종료 예외는 오류 알림에서 제외합니다.");
            return;
        }

        try {
            String where = request != null ? describe(request) : "-";
            String detail = exception.getClass().getSimpleName();

            notifications.notify(
                    new NotificationMessage(
                            NotificationChannel.ERROR,
                            "서버 오류가 발생했어요",
                            detail,
                            List.of(new NotificationMessage.Field("요청", where))));
        } catch (Exception notifyFailure) {
            log.warn("오류 알림 전송을 건너뜁니다: type={}", notifyFailure.getClass().getSimpleName());
        }
    }

    /** 오류 경로로 넘어온 요청이면 알림에는 처음 들어온 요청을 적는다. */
    private static String describe(HttpServletRequest request) {
        Object originalUri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        if (originalUri == null) {
            return request.getMethod() + " " + request.getRequestURI();
        }
        Object originalMethod = request.getAttribute(RequestDispatcher.ERROR_METHOD);
        return (originalMethod != null ? originalMethod : request.getMethod()) + " " + originalUri;
    }
}
