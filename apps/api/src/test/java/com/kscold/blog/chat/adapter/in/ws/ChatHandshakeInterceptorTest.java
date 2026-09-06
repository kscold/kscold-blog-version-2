package com.kscold.blog.chat.adapter.in.ws;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import jakarta.servlet.http.Cookie;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpResponse;
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
        when(tokenProvider.parseAccessToken("cookie-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-id", 4L)));
        when(userQueryPort.findAuthenticationById("user-id"))
                .thenReturn(
                        Optional.of(
                                new UserQueryPort.AuthenticationInfo("user-id", "사용자", false, 4L)));
        Map<String, Object> attributes = new HashMap<>();

        boolean accepted = handshake(request, attributes);

        assertThat(accepted).isTrue();
        assertThat(attributes)
                .containsEntry("userId", "user-id")
                .containsEntry("username", "사용자")
                .containsEntry("isAdmin", false)
                .containsEntry("credentialVersion", 4L);
        verify(tokenProvider, never()).parseAccessToken("query-token");
    }

    @Test
    void rejectsLegacyQueryToken() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addParameter("token", "query-token");
        ServerHttpResponse response = mock(ServerHttpResponse.class);

        boolean accepted = handshake(request, response, new HashMap<>());

        assertThat(accepted).isFalse();
        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
        verify(tokenProvider, never()).parseAccessToken("query-token");
    }

    @Test
    void rejectsMissingToken() {
        ServerHttpResponse response = mock(ServerHttpResponse.class);

        boolean accepted = handshake(new MockHttpServletRequest(), response, new HashMap<>());

        assertThat(accepted).isFalse();
        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void rejectsTokenForMissingUserWithUnauthorizedStatus() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("auth-token", "valid-token"));
        when(tokenProvider.parseAccessToken("valid-token"))
                .thenReturn(Optional.of(new TokenIdentity("missing-user-id", 0L)));
        when(userQueryPort.findAuthenticationById("missing-user-id")).thenReturn(Optional.empty());
        ServerHttpResponse response = mock(ServerHttpResponse.class);

        boolean accepted = handshake(request, response, new HashMap<>());

        assertThat(accepted).isFalse();
        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void rejectsTokenWhenCredentialVersionHasChanged() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("auth-token", "stale-token"));
        when(tokenProvider.parseAccessToken("stale-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-id", 1L)));
        when(userQueryPort.findAuthenticationById("user-id"))
                .thenReturn(
                        Optional.of(
                                new UserQueryPort.AuthenticationInfo("user-id", "관리자", true, 2L)));
        ServerHttpResponse response = mock(ServerHttpResponse.class);

        boolean accepted = handshake(request, response, new HashMap<>());

        assertThat(accepted).isFalse();
        verify(response).setStatusCode(HttpStatus.UNAUTHORIZED);
    }

    private boolean handshake(MockHttpServletRequest request, Map<String, Object> attributes) {
        return handshake(request, mock(ServerHttpResponse.class), attributes);
    }

    private boolean handshake(
            MockHttpServletRequest request,
            ServerHttpResponse response,
            Map<String, Object> attributes) {
        return interceptor.beforeHandshake(
                new ServletServerHttpRequest(request),
                response,
                mock(WebSocketHandler.class),
                attributes);
    }
}
