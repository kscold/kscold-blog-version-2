package com.kscold.blog.shared.web.ratelimit;

import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

/**
 * 예전에 Nginx에서 하던 API 요청 제한을 백엔드에서 한다.
 *
 * <p>로그인 정보를 읽은 뒤에 돌아야 하므로 보안 필터 체인에서 JWT 필터 다음에 둔다. 로그인한 요청은 사용자별로, 아니면 클라이언트 IP별로 센다.
 */
@Slf4j
@Component
public class ApiRateLimitFilter extends OncePerRequestFilter {

    private static final String LIMIT_MESSAGE = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";

    private final ApiRateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final TrustedProxyClientAddress clientAddress;
    private final TokenBucketRateLimiter limiter;

    public ApiRateLimitFilter(ApiRateLimitProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.clientAddress = new TrustedProxyClientAddress(properties.getTrustedProxies());
        this.limiter =
                new TokenBucketRateLimiter(properties.getMaxTrackedClients(), System::nanoTime);
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        Optional<ApiRateLimitPolicy> policy =
                properties.isEnabled()
                        ? ApiRateLimitPolicies.find(request.getMethod(), requestPath(request))
                        : Optional.empty();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (policy.isEmpty() || (policy.get().exemptsAdmin() && isAdmin(authentication))) {
            filterChain.doFilter(request, response);
            return;
        }

        String client = clientKey(request, authentication);
        long retryAfterSeconds =
                limiter.tryAcquire(policy.get().name() + "|" + client, policy.get());
        if (retryAfterSeconds > 0) {
            // 클라이언트 식별 정보는 남기지 않는다.
            log.warn(
                    "[RATE_LIMIT] {} {} {}",
                    policy.get().name(),
                    request.getMethod(),
                    requestPath(request));
            writeTooManyRequests(response, retryAfterSeconds);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String clientKey(HttpServletRequest request, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            return "user:" + authentication.getName();
        }
        return "ip:" + clientAddress.resolve(request);
    }

    private static boolean isAdmin(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getAuthorities().stream()
                        .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private static String requestPath(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        return contextPath != null && uri.startsWith(contextPath)
                ? uri.substring(contextPath.length())
                : uri;
    }

    private void writeTooManyRequests(HttpServletResponse response, long retryAfterSeconds)
            throws IOException {
        ErrorCode errorCode = ErrorCode.RATE_LIMIT_EXCEEDED;
        response.setStatus(errorCode.getStatus().value());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfterSeconds));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(), ApiResponse.error(errorCode.getCode(), LIMIT_MESSAGE));
    }
}
