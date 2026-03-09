package com.kscold.blog.identity.application.dto;

import com.kscold.blog.identity.domain.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResult {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserInfo user;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private String username;
        private String displayName;
        private User.Role role;
    }
}
