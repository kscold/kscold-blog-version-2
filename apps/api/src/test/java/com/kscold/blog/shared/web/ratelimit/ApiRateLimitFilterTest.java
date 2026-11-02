package com.kscold.blog.shared.web.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import com.kscold.blog.support.TestJson;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class ApiRateLimitFilterTest {

    private static final String TRUSTED_PROXY = "172.18.0.3";

    private final ApiRateLimitFilter filter =
            new ApiRateLimitFilter(new ApiRateLimitProperties(), TestJson.mapper());

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void uploadIsLimitedAfterBurstAndTellsWhenToRetry() throws Exception {
        signIn("user-1", "ROLE_USER");

        for (int attempt = 0; attempt < 5; attempt++) {
            assertThat(send("POST", "/media/upload", TRUSTED_PROXY, null).getStatus())
                    .isEqualTo(200);
        }
        MockHttpServletResponse limited = send("POST", "/media/upload", TRUSTED_PROXY, null);

        assertThat(limited.getStatus()).isEqualTo(429);
        assertThat(Long.parseLong(limited.getHeader("Retry-After"))).isPositive();
        assertThat(limited.getContentAsString()).contains("E501");
    }

    @Test
    void administratorsAreNotLimitedWhenUploadingPostImages() throws Exception {
        signIn("admin-1", "ROLE_ADMIN");

        for (int attempt = 0; attempt < 30; attempt++) {
            assertThat(send("POST", "/media/upload", TRUSTED_PROXY, null).getStatus())
                    .isEqualTo(200);
        }
    }

    @Test
    void signedInUsersAreCountedSeparately() throws Exception {
        signIn("user-1", "ROLE_USER");
        for (int attempt = 0; attempt < 5; attempt++) {
            send("POST", "/media/upload", TRUSTED_PROXY, null);
        }

        signIn("user-2", "ROLE_USER");
        assertThat(send("POST", "/media/upload", TRUSTED_PROXY, null).getStatus()).isEqualTo(200);
    }

    @Test
    void loginIsCountedPerClientForwardedByTheTrustedProxy() throws Exception {
        for (int attempt = 0; attempt < 11; attempt++) {
            assertThat(send("POST", "/auth/login", TRUSTED_PROXY, "203.0.113.10").getStatus())
                    .isEqualTo(200);
        }

        assertThat(send("POST", "/auth/login", TRUSTED_PROXY, "203.0.113.10").getStatus())
                .isEqualTo(429);
        assertThat(send("POST", "/auth/login", TRUSTED_PROXY, "203.0.113.11").getStatus())
                .isEqualTo(200);
    }

    @Test
    void forwardedHeaderFromAnUntrustedConnectionCannotDodgeTheLimit() throws Exception {
        for (int attempt = 0; attempt < 11; attempt++) {
            send("POST", "/auth/login", "198.51.100.7", "203.0.113." + attempt);
        }

        assertThat(send("POST", "/auth/login", "198.51.100.7", "203.0.113.99").getStatus())
                .isEqualTo(429);
    }

    @Test
    void rulesInTheSameGroupShareOneBucket() throws Exception {
        for (int attempt = 0; attempt < 11; attempt++) {
            send("POST", "/vault/agent/chat", TRUSTED_PROXY, "203.0.113.20");
        }

        assertThat(send("POST", "/feeds/copilot/plan", TRUSTED_PROXY, "203.0.113.20").getStatus())
                .isEqualTo(429);
    }

    @Test
    void requestsOutsideTheRulesAreNeverCounted() throws Exception {
        for (int attempt = 0; attempt < 50; attempt++) {
            assertThat(send("GET", "/posts", TRUSTED_PROXY, "203.0.113.30").getStatus())
                    .isEqualTo(200);
        }
    }

    @Test
    void disabledLimiterLetsEveryRequestThrough() throws Exception {
        ApiRateLimitProperties properties = new ApiRateLimitProperties();
        properties.setEnabled(false);
        ApiRateLimitFilter disabled = new ApiRateLimitFilter(properties, TestJson.mapper());

        for (int attempt = 0; attempt < 20; attempt++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            disabled.doFilter(
                    request("POST", "/auth/login", TRUSTED_PROXY, "203.0.113.40"),
                    response,
                    (req, res) -> {});
            assertThat(response.getStatus()).isEqualTo(200);
        }
    }

    @Test
    void bucketRefillsAtThePolicyRate() {
        AtomicLong clock = new AtomicLong();
        TokenBucketRateLimiter limiter = new TokenBucketRateLimiter(10, clock::get);
        ApiRateLimitPolicy upload =
                ApiRateLimitPolicies.find("POST", "/media/upload").orElseThrow();

        for (int attempt = 0; attempt < upload.capacity(); attempt++) {
            assertThat(limiter.tryAcquire("upload|user:1", upload)).isZero();
        }
        assertThat(limiter.tryAcquire("upload|user:1", upload)).isEqualTo(10);

        // 분당 6개면 10초에 하나씩 다시 찬다. 소수 오차를 피하려고 조금 더 기다린다.
        clock.addAndGet(11_000_000_000L);
        assertThat(limiter.tryAcquire("upload|user:1", upload)).isZero();
    }

    @Test
    void policiesKeepTheValuesThatUsedToLiveInNginx() {
        assertThat(ApiRateLimitPolicies.find("POST", "/auth/login").orElseThrow())
                .extracting(
                        ApiRateLimitPolicy::name,
                        ApiRateLimitPolicy::ratePerMinute,
                        ApiRateLimitPolicy::burst)
                .containsExactly("auth", 10, 10);
        assertThat(ApiRateLimitPolicies.find("POST", "/team/private").orElseThrow().name())
                .isEqualTo("recovery");
        assertThat(ApiRateLimitPolicies.find("GET", "/github/kscold/repos").orElseThrow().name())
                .isEqualTo("external");
        assertThat(
                        ApiRateLimitPolicies.find("POST", "/feeds/feed-1/comments/comment-1/like")
                                .orElseThrow())
                .extracting(
                        ApiRateLimitPolicy::name,
                        ApiRateLimitPolicy::ratePerMinute,
                        ApiRateLimitPolicy::burst)
                .containsExactly("engagement", 30, 15);
        assertThat(ApiRateLimitPolicies.find("POST", "/posts")).isEmpty();
        assertThat(ApiRateLimitPolicies.find("GET", "/media/upload")).isEmpty();
    }

    @Test
    void trustedProxyRangesAcceptCidrNotation() {
        TrustedProxyClientAddress address = new TrustedProxyClientAddress("172.16.0.0/12,::1/128");

        assertThat(address.resolve(request("POST", "/auth/login", "172.31.255.1", "203.0.113.50")))
                .isEqualTo("203.0.113.50");
        assertThat(address.resolve(request("POST", "/auth/login", "172.32.0.1", "203.0.113.50")))
                .isEqualTo("172.32.0.1");
        assertThat(address.resolve(request("POST", "/auth/login", "172.18.0.3", "not-an-ip")))
                .isEqualTo("172.18.0.3");
    }

    private MockHttpServletResponse send(
            String method, String path, String remote, String forwarded) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request(method, path, remote, forwarded), response, (req, res) -> {});
        return response;
    }

    private static MockHttpServletRequest request(
            String method, String path, String remote, String forwarded) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, "/api" + path);
        request.setContextPath("/api");
        request.setRemoteAddr(remote);
        if (forwarded != null) {
            request.addHeader("X-Forwarded-For", forwarded);
        }
        return request;
    }

    private static void signIn(String userId, String role) {
        SecurityContextHolder.getContext()
                .setAuthentication(
                        UsernamePasswordAuthenticationToken.authenticated(
                                userId, null, List.of(new SimpleGrantedAuthority(role))));
    }
}
