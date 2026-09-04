package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.kscold.blog.identity.adapter.out.security.JwtTokenProvider;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import jakarta.servlet.http.Cookie;
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

    @Mock private JwtTokenProvider jwtTokenProvider;
    @Mock private UserQueryPort userQueryPort;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new JwtAuthenticationFilter(jwtTokenProvider, userQueryPort);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatesWithTheUsersCurrentRole() throws Exception {
        MockHttpServletRequest request = authenticatedRequest();
        when(jwtTokenProvider.validateAccessToken("access-token")).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromAccessToken("access-token")).thenReturn("user-1");
        when(userQueryPort.findAuthenticationById("user-1"))
                .thenReturn(
                        java.util.Optional.of(
                                new UserQueryPort.AuthenticationInfo("user-1", false)));

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
        when(jwtTokenProvider.validateAccessToken("access-token")).thenReturn(true);
        when(jwtTokenProvider.getUserIdFromAccessToken("access-token")).thenReturn("user-1");
        when(userQueryPort.findAuthenticationById("user-1")).thenReturn(java.util.Optional.empty());

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    private MockHttpServletRequest authenticatedRequest() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/auth/me");
        request.setCookies(new Cookie("auth-token", "access-token"));
        return request;
    }
}
