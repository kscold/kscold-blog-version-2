package com.kscold.blog.shared.web;

import com.kscold.blog.exception.StatusErrorResponse;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 컨트롤러에 닿기 전에, 또는 예외 처리기 밖에서 실패한 요청의 응답을 맡는다.
 *
 * <p>필터에서 난 예외나 서블릿 컨테이너가 직접 거절한 요청(TRACE 등)은 서블릿의 오류 경로로 넘어온다. 이 경로를 맡는 곳이 없으면 실제 상태 코드 대신 "인증이
 * 필요합니다"(401)가 나가, 서버 장애나 잘못된 요청이 로그인 만료처럼 보인다.
 */
@Slf4j
@RestController
public class FallbackErrorController implements ErrorController {

    @RequestMapping("${spring.web.error.path:/error}")
    public @Nullable ResponseEntity<ApiResponse<Void>> handle(
            HttpServletRequest request, HttpServletResponse response) throws Exception {
        if (response.isCommitted()) {
            // 스트리밍 도중 끊긴 응답이다. 이미 보낸 본문 뒤에 오류 본문을 덧붙이지 않는다.
            return null;
        }
        if (request.getAttribute(RequestDispatcher.ERROR_EXCEPTION) instanceof Exception failure) {
            // 필터에서 난 예외도 컨트롤러에서 난 예외와 같은 처리기(로그·알림·응답 형식)를 거치게 한다.
            throw failure;
        }

        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        if (statusCode == null) {
            // 오류로 넘어온 요청이 아니라 이 주소를 직접 부른 경우다.
            return StatusErrorResponse.of(HttpStatus.NOT_FOUND);
        }

        HttpStatus status = errorStatusOf(statusCode);
        if (status.is5xxServerError()) {
            log.error("컨트롤러 밖에서 요청이 실패했습니다: status={}", status.value());
        } else {
            log.warn("컨트롤러에 닿기 전에 거절된 요청입니다: status={}", status.value());
        }
        return StatusErrorResponse.of(status);
    }

    private static HttpStatus errorStatusOf(Object statusCode) {
        HttpStatus status = statusCode instanceof Integer value ? HttpStatus.resolve(value) : null;
        return status != null && status.isError() ? status : HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
