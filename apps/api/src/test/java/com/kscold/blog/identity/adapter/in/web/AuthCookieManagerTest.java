package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import jakarta.servlet.http.Cookie;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class AuthCookieManagerTest {

    @Test
    void addsSecureHttpOnlyAuthenticationCookiesWithTokenLifetimes() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, true);
        MockHttpServletResponse response = new MockHttpServletResponse();
        AuthResponse authResponse =
                AuthResponse.builder()
                        .accessToken("access-token")
                        .refreshToken("refresh-token")
                        .build();

        manager.addAuthenticationCookies(response, authResponse);

        List<String> cookies = response.getHeaders(HttpHeaders.SET_COOKIE);
        assertThat(cookies)
                .hasSize(2)
                .allSatisfy(
                        cookie ->
                                assertThat(cookie)
                                        .contains("HttpOnly", "Secure", "SameSite=Lax", "Path=/"));
        assertThat(cookies.get(0)).contains("auth-token=access-token", "Max-Age=3600");
        assertThat(cookies.get(1)).contains("refresh-token=refresh-token", "Max-Age=604800");
    }

    @Test
    void omitsSecureAttributeForLocalHttpDevelopment() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, false);
        MockHttpServletResponse response = new MockHttpServletResponse();

        manager.addAuthenticationCookies(
                response,
                AuthResponse.builder()
                        .accessToken("access-token")
                        .refreshToken("refresh-token")
                        .build());

        assertThat(response.getHeaders(HttpHeaders.SET_COOKIE))
                .allSatisfy(cookie -> assertThat(cookie).doesNotContain("Secure"));
    }

    @Test
    void resolvesRefreshCookieBeforeLegacyRequestBodyToken() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, true);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh-token", "cookie-token"));

        String token = manager.resolveRefreshToken(request, "body-token");

        assertThat(token).isEqualTo("cookie-token");
    }

    @Test
    void supportsLegacyRequestBodyTokenDuringCookieMigration() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, true);

        String token = manager.resolveRefreshToken(new MockHttpServletRequest(), "body-token");

        assertThat(token).isEqualTo("body-token");
    }

    @Test
    void rejectsMissingOrOversizedRefreshTokens() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, true);
        MockHttpServletRequest request = new MockHttpServletRequest();

        assertThatThrownBy(() -> manager.resolveRefreshToken(request, null))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(com.kscold.blog.exception.ErrorCode.INVALID_TOKEN);
        assertThatThrownBy(() -> manager.resolveRefreshToken(request, "x".repeat(2049)))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void clearsBothAuthenticationCookiesWithTheSameSecurityPolicy() {
        AuthCookieManager manager = new AuthCookieManager(3_600_000, 604_800_000, true);
        MockHttpServletResponse response = new MockHttpServletResponse();

        manager.clearAuthenticationCookies(response);

        assertThat(response.getHeaders(HttpHeaders.SET_COOKIE))
                .hasSize(2)
                .allSatisfy(
                        cookie ->
                                assertThat(cookie)
                                        .contains(
                                                "Max-Age=0",
                                                "HttpOnly",
                                                "Secure",
                                                "SameSite=Lax",
                                                "Path=/"));
    }
}
