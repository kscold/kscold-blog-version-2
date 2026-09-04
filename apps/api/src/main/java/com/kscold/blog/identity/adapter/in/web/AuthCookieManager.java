package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.response.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieManager {

    static final String ACCESS_TOKEN_COOKIE = "auth-token";
    static final String REFRESH_TOKEN_COOKIE = "refresh-token";

    private final Duration accessTokenMaxAge;
    private final Duration refreshTokenMaxAge;
    private final boolean secure;

    public AuthCookieManager(
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration,
            @Value("${auth.cookie-secure:false}") boolean secure) {
        this.accessTokenMaxAge = Duration.ofMillis(accessTokenExpiration);
        this.refreshTokenMaxAge = Duration.ofMillis(refreshTokenExpiration);
        this.secure = secure;
    }

    public void addAuthenticationCookies(HttpServletResponse response, AuthResponse authResponse) {
        addCookie(response, ACCESS_TOKEN_COOKIE, authResponse.getAccessToken(), accessTokenMaxAge);
        addCookie(
                response, REFRESH_TOKEN_COOKIE, authResponse.getRefreshToken(), refreshTokenMaxAge);
    }

    private void addCookie(
            HttpServletResponse response, String name, String value, Duration maxAge) {
        ResponseCookie cookie =
                ResponseCookie.from(name, value)
                        .httpOnly(true)
                        .secure(secure)
                        .sameSite("Lax")
                        .path("/")
                        .maxAge(maxAge)
                        .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
