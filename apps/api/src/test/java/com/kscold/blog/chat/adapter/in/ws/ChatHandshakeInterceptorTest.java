package com.kscold.blog.chat.adapter.in.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.socket.WebSocketHandler;

@ExtendWith(MockitoExtension.class)
class ChatHandshakeInterceptorTest {

    @Mock private TokenProvider tokenProvider;
    @Mock private UserQueryPort userQueryPort;

    private ChatHandshakeInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new ChatHandshakeInterceptor(tokenProvider, userQueryPort);
    }

    @Test
    void authenticatesWithCookieBeforeLegacyQuery() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("auth-token", "cookie-token"));
        request.addParameter("token", "query-token");
        when(tokenProvider.validateAccessToken("cookie-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromAccessToken("cookie-token")).thenReturn("user-id");
        when(userQueryPort.getUserById("user-id"))
                .thenReturn(new UserQueryPort.UserInfo("user-id", "user", "사용자", "", false, ""));
        Map<String, Object> attributes = new HashMap<>();

        boolean accepted = handshake(request, attributes);

        assertThat(accepted).isTrue();
        assertThat(attributes)
                .containsEntry("userId", "user-id")
                .containsEntry("username", "사용자")
                .containsEntry("isAdmin", false);
        verify(tokenProvider, never()).validateAccessToken("query-token");
    }

    @Test
    void rejectsLegacyQueryToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addParameter("token", "query-token");

        boolean accepted = handshake(request, new HashMap<>());

        assertThat(accepted).isFalse();
        verify(tokenProvider, never()).validateAccessToken("query-token");
    }

    @Test
    void rejectsMissingToken() {
        boolean accepted = handshake(new MockHttpServletRequest(), new HashMap<>());

        assertThat(accepted).isFalse();
    }

    private boolean handshake(MockHttpServletRequest request, Map<String, Object> attributes) {
        return interceptor.beforeHandshake(
                new ServletServerHttpRequest(request),
                mock(org.springframework.http.server.ServerHttpResponse.class),
                mock(WebSocketHandler.class),
                attributes);
    }
}
