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
public class AdminUserResponse {
    private String id;
    private String email;
    private String username;
    private String displayName;
    private String role;
    private String avatar;
    private String bio;
    private Map<String, String> socialLinks;
    private List<String> techStack;
    private String createdAt;
    private boolean deleted;

    public static AdminUserResponse from(User user) {
        User.Profile p = user.getProfile();
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole() != null ? user.getRole().name() : "USER",
                p != null ? p.getAvatar() : null,
                p != null ? p.getBio() : null,
                p != null ? p.getSocialLinks() : null,
                p != null ? p.getTechStack() : null,
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.isDeleted());
    }
}
