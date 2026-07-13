package com.kscold.blog.identity.application.dto.response;

import com.kscold.blog.identity.domain.model.User;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UserInfo user;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class UserInfo {
        private String id;
        private String email;
        private String username;
        private String displayName;
        private User.Role role;
        private String avatar;
        private String bio;
        private Map<String, String> socialLinks;
        private List<String> techStack;

        public static UserInfo from(User user) {
            User.Profile p = user.getProfile();
            return UserInfo.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .username(user.getUsername())
                    .displayName(user.getDisplayName())
                    .role(user.getRole())
                    .avatar(p != null ? p.getAvatar() : null)
                    .bio(p != null ? p.getBio() : null)
                    .socialLinks(p != null ? p.getSocialLinks() : null)
                    .techStack(p != null ? p.getTechStack() : null)
                    .build();
        }
    }
}
