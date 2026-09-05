package com.kscold.blog.adminnight.application.service;

import org.springframework.util.StringUtils;

final class AdminNightPrincipalPolicy {

    private static final String ANONYMOUS_PRINCIPAL = "anonymousUser";

    private AdminNightPrincipalPolicy() {}

    static boolean isAuthenticated(String userId) {
        return StringUtils.hasText(userId) && !ANONYMOUS_PRINCIPAL.equals(userId);
    }
}
