package com.kscold.blog.identity.adapter.in.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.config.CorsOriginPolicy;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class CookieCsrfProtectionFilter extends OncePerRequestFilter {

    private static final Set<String> SAFE_METHODS = Set.of("GET", "HEAD", "OPTIONS", "TRACE");
    private static final String ORIGIN_HEADER = "Origin";
    private static final String FETCH_SITE_HEADER = "Sec-Fetch-Site";

    private final CorsOriginPolicy corsOriginPolicy;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        if (!requiresOriginValidation(request)) {
            filterChain.doFilter(request, response);
            return;
        }

        String origin = request.getHeader(ORIGIN_HEADER);
        String fetchSite = request.getHeader(FETCH_SITE_HEADER);
        boolean rejectedOrigin = StringUtils.hasText(origin) && !corsOriginPolicy.allows(origin);
        boolean rejectedFetchSite =
                !StringUtils.hasText(origin) && "cross-site".equalsIgnoreCase(fetchSite);

        if (rejectedOrigin || rejectedFetchSite) {
            writeForbidden(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean requiresOriginValidation(HttpServletRequest request) {
        if (SAFE_METHODS.contains(request.getMethod())) {
            return false;
        }
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return false;
        }
        for (Cookie cookie : cookies) {
            if ((AuthCookieManager.ACCESS_TOKEN_COOKIE.equals(cookie.getName())
                            || AuthCookieManager.REFRESH_TOKEN_COOKIE.equals(cookie.getName()))
                    && StringUtils.hasText(cookie.getValue())) {
                return true;
            }
        }
        return false;
    }

    private void writeForbidden(HttpServletResponse response) throws IOException {
        ErrorCode errorCode = ErrorCode.FORBIDDEN;
        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(), ApiResponse.error(errorCode.getCode(), "허용되지 않은 출처의 요청입니다."));
    }
}
