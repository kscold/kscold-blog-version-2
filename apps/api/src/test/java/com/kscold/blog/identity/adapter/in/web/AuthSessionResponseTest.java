package com.kscold.blog.identity.adapter.in.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.domain.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AuthSessionResponseTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @DisplayName("시나리오: 인증 응답을 직렬화해도 JWT는 본문에 포함되지 않는다")
    void serializationExcludesAuthenticationTokens() throws Exception {
        AuthResponse.UserInfo user =
                AuthResponse.UserInfo.builder()
                        .id("user-1")
                        .email("user@example.com")
                        .username("user")
                        .displayName("사용자")
                        .role(User.Role.USER)
                        .build();
        AuthResponse authResponse =
                AuthResponse.builder()
                        .accessToken("test-access-token")
                        .refreshToken("test-refresh-token")
                        .tokenType("Bearer")
                        .user(user)
                        .build();

        String json = objectMapper.writeValueAsString(AuthSessionResponse.from(authResponse));

        assertThat(json).contains("\"user\"").contains("\"username\":\"user\"");
        assertThat(json)
                .doesNotContain("accessToken")
                .doesNotContain("refreshToken")
                .doesNotContain("tokenType")
                .doesNotContain("test-access-token")
                .doesNotContain("test-refresh-token");
    }
}
