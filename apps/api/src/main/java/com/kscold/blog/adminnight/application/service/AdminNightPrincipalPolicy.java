package com.kscold.blog.adminnight.application.service;

import com.kscold.blog.shared.security.AuthenticatedPrincipalPolicy;

final class AdminNightPrincipalPolicy {

    private AdminNightPrincipalPolicy() {}

    static boolean isAuthenticated(String userId) {
        return AuthenticatedPrincipalPolicy.isAuthenticated(userId);
    }
}
