package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.identity.application.dto.response.AuthResponse;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
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
}
