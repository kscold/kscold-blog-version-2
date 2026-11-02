package com.kscold.blog.shared.web.ratelimit;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * API 요청 제한 규칙 목록. 예전에 Nginx(kscold-control nginx.conf)에 두던 값을 그대로 옮겼다.
 *
 * <p>바꿀 일이 생기면 Nginx가 아니라 여기를 고친다.
 */
final class ApiRateLimitPolicies {

    static final List<ApiRateLimitPolicy> DEFAULTS =
            List.of(
                    // 로그인·가입 대입 공격을 늦춘다.
                    policy("auth", "POST", "/auth/(login|register)", 10, 10, false),
                    // 메일이 나가는 계정 찾기와 팀 비공개 페이지 열기는 더 좁게 둔다.
                    policy(
                            "recovery",
                            "POST",
                            "/auth/(recover-username|request-password-reset)",
                            3,
                            3,
                            false),
                    policy("recovery", "POST", "/team/private", 3, 3, false),
                    // 외부 API·AI 비용이 드는 요청.
                    policy("external", "GET", "/github/.*", 10, 10, false),
                    policy("external", "POST", "/vault/agent/chat(/stream)?", 10, 10, false),
                    policy("external", "POST", "/feeds/copilot/(plan|draft)/?", 10, 10, false),
                    // 업로드. 관리자는 글 이미지를 한꺼번에 올리므로 제외한다.
                    policy("upload", "POST", "/media/upload", 6, 4, true),
                    policy("upload", "POST", "/admin/storage/files", 6, 4, true),
                    // 결제·투표.
                    policy(
                            "commercial",
                            "POST",
                            "/payments/ai-agent-bloom/(prepare|complete)",
                            6,
                            6,
                            false),
                    policy("commercial", "POST", "/admin-night/programs/[^/]+/votes", 6, 6, false),
                    // 방문 기록·좋아요.
                    policy("engagement", "POST", "/analytics/page-visit", 30, 15, false),
                    policy("engagement", "POST", "/feeds/[^/]+/like", 30, 15, false),
                    policy(
                            "engagement",
                            "POST",
                            "/feeds/[^/]+/comments/[^/]+/like",
                            30,
                            15,
                            false));

    private ApiRateLimitPolicies() {}

    static Optional<ApiRateLimitPolicy> find(String method, String path) {
        return DEFAULTS.stream().filter(policy -> policy.matches(method, path)).findFirst();
    }

    private static ApiRateLimitPolicy policy(
            String name, String method, String path, int ratePerMinute, int burst, boolean admin) {
        return new ApiRateLimitPolicy(
                name, method, Pattern.compile(path), ratePerMinute, burst, admin);
    }
}
