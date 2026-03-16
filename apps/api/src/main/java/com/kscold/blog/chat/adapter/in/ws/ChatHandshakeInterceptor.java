package com.kscold.blog.chat.adapter.in.ws;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ChatHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return false;
        }

        String token = servletRequest.getServletRequest().getParameter("token");
        if (token == null || token.isBlank() || !jwtTokenProvider.validateToken(token)) {
            log.warn("WebSocket 연결 거부: 유효하지 않은 토큰");
            return false;
        }

        String userId = jwtTokenProvider.getUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("WebSocket 연결 거부: 존재하지 않는 사용자 ({})", userId);
            return false;
        }

        attributes.put("userId", userId);
        attributes.put("username", user.getDisplayName());
        attributes.put("isAdmin", user.getRole() == User.Role.ADMIN);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
