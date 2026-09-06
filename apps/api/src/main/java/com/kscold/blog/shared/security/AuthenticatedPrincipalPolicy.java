package com.kscold.blog.shared.security;

import org.springframework.lang.Nullable;
import org.springframework.util.StringUtils;

/** Spring Security의 익명 principal을 실제 사용자 식별자로 오인하지 않도록 정규화한다. */
public final class AuthenticatedPrincipalPolicy {

    private static final String ANONYMOUS_PRINCIPAL = "anonymousUser";

    private AuthenticatedPrincipalPolicy() {}

    public static boolean isAuthenticated(@Nullable String userId) {
        return normalize(userId) != null;
    }

    @Nullable
    public static String normalize(@Nullable String userId) {
        if (!StringUtils.hasText(userId) || ANONYMOUS_PRINCIPAL.equals(userId)) {
            return null;
        }
        return userId;
    }
}
