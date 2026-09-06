package com.kscold.blog.shared.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class AuthenticatedPrincipalPolicyTest {

    @Test
    void 익명과_공백_principal은_사용자_식별자가_아니다() {
        assertThat(AuthenticatedPrincipalPolicy.normalize(null)).isNull();
        assertThat(AuthenticatedPrincipalPolicy.normalize(" ")).isNull();
        assertThat(AuthenticatedPrincipalPolicy.normalize("anonymousUser")).isNull();
    }

    @Test
    void 인증된_사용자_식별자는_그대로_유지한다() {
        assertThat(AuthenticatedPrincipalPolicy.normalize("user-1")).isEqualTo("user-1");
        assertThat(AuthenticatedPrincipalPolicy.isAuthenticated("user-1")).isTrue();
    }
}
