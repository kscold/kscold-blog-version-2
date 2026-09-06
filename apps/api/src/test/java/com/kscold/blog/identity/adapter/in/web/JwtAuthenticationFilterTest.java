package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import jakarta.servlet.http.Cookie;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private TokenProvider tokenProvider;
    @Mock private UserQueryPort userQueryPort;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(tokenProvider, userQueryPort);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesWithTheUsersCurrentRole() throws Exception {
        MockHttpServletRequest request = authenticatedRequest();
        when(tokenProvider.parseAccessToken("access-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 3L)));
        when(userQueryPort.findAuthenticationById("user-1"))
                .thenReturn(
                        java.util.Optional.of(
                                new UserQueryPort.AuthenticationInfo("user-1", "사용자", false, 3L)));

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication().getPrincipal())
                .isEqualTo("user-1");
        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    void rejectsTokenWhenTheAccountIsMissingOrDeleted() throws Exception {
        MockHttpServletRequest request = authenticatedRequest();
        when(tokenProvider.parseAccessToken("access-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 0L)));
        when(userQueryPort.findAuthenticationById("user-1")).thenReturn(java.util.Optional.empty());

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void rejectsTokenWhenCredentialVersionHasChanged() throws Exception {
        MockHttpServletRequest request = authenticatedRequest();
        when(tokenProvider.parseAccessToken("access-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 2L)));
        when(userQueryPort.findAuthenticationById("user-1"))
                .thenReturn(
                        Optional.of(
                                new UserQueryPort.AuthenticationInfo("user-1", "관리자", true, 3L)));

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private MockHttpServletRequest authenticatedRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/auth/me");
        request.setCookies(new Cookie("auth-token", "access-token"));
        return request;
    }
}
