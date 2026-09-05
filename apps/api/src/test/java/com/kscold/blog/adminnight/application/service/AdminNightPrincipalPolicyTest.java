package com.kscold.blog.adminnight.application.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminNightPrincipalPolicyTest {

    @Test
    @DisplayName("빈 값과 익명 principal은 인증 사용자로 보지 않는다")
    void rejectsMissingAndAnonymousPrincipal() {
        assertThat(
                        List.of(
                                AdminNightPrincipalPolicy.isAuthenticated(null),
                                AdminNightPrincipalPolicy.isAuthenticated(" "),
                                AdminNightPrincipalPolicy.isAuthenticated("anonymousUser")))
                .containsOnly(false);
    }

    @Test
    @DisplayName("사용자 ID가 있으면 인증 사용자로 본다")
    void acceptsUserId() {
        assertThat(AdminNightPrincipalPolicy.isAuthenticated("user-1")).isTrue();
    }
}
