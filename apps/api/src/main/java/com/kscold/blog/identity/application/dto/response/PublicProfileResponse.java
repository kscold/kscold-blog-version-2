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
public class PublicProfileResponse {
    private String id;
    private String username;
    private String displayName;
    private String avatar;
    private String bio;
    private Map<String, String> socialLinks;
    private List<String> techStack;

    public static PublicProfileResponse from(User user) {
        User.Profile p = user.getProfile();
        return new PublicProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                p != null ? p.getAvatar() : null,
                p != null ? p.getBio() : null,
                p != null ? p.getSocialLinks() : null,
                p != null ? p.getTechStack() : null);
    }
}
