package com.kscold.blog.identity.application.dto;

import com.kscold.blog.identity.domain.model.User;
import java.util.List;
import java.util.Map;

public record PublicProfileDto(
        String id,
        String username,
        String displayName,
        String avatar,
        String bio,
        Map<String, String> socialLinks,
        List<String> techStack) {
    public static PublicProfileDto from(User user) {
        User.Profile p = user.getProfile();
        return new PublicProfileDto(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                p != null ? p.getAvatar() : null,
                p != null ? p.getBio() : null,
                p != null ? p.getSocialLinks() : null,
                p != null ? p.getTechStack() : null);
    }
}
