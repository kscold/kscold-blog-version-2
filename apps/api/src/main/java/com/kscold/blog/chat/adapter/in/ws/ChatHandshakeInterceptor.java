package com.kscold.blog.chat.adapter.in.ws;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    private static final String ACCESS_TOKEN_COOKIE = "auth-token";

    private final TokenProvider tokenProvider;
    private final UserQueryPort userQueryPort;

    @Override
    public boolean beforeHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            @NonNull Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }

        String token = resolveToken(servletRequest.getServletRequest());
        if (token == null || token.isBlank() || !tokenProvider.validateAccessToken(token)) {
            log.warn("WebSocket 연결 거부: 유효하지 않은 토큰");
            return false;
        }

        String userId = tokenProvider.getUserIdFromAccessToken(token);
        UserQueryPort.UserInfo user;
        try {
            user = userQueryPort.getUserById(userId);
        } catch (Exception e) {
            log.warn("WebSocket 연결 거부: 존재하지 않는 사용자");
            return false;
        }

        attributes.put("userId", userId);
        attributes.put("username", user.displayName());
        attributes.put("isAdmin", user.isAdmin());
        return true;
    }

    @Override
    public void afterHandshake(
            @NonNull ServerHttpRequest request,
            @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler,
            Exception exception) {}

    private String resolveToken(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                String value = cookie.getValue();
                if (ACCESS_TOKEN_COOKIE.equals(cookie.getName())
                        && value != null
                        && !value.isBlank()) {
                    return value;
                }
            }
        }

        // 프런트엔드 쿠키 전환이 끝날 때까지만 기존 쿼리 인증을 허용한다.
        return request.getParameter("token");
    }
}
