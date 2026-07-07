package com.kscold.blog.identity.application.dto;

import com.kscold.blog.identity.domain.model.User;
import java.util.List;
import java.util.Map;

public record AdminUserDto(
        String id,
        String email,
        String username,
        String displayName,
        String role,
        String avatar,
        String bio,
        Map<String, String> socialLinks,
        List<String> techStack,
        String createdAt,
        boolean deleted) {
    public static AdminUserDto from(User user) {
        User.Profile p = user.getProfile();
        return new AdminUserDto(
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
