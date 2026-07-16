package com.kscold.blog.social.adapter.in.web.dto.response;

import com.kscold.blog.identity.domain.model.User;

/** 댓글 @언급 자동완성용 사용자 정보. */
public record MentionableUserResponse(
        String username, String displayName, String avatar, boolean isAdmin) {

    public static MentionableUserResponse from(User user) {
        String avatar = user.getProfile() != null ? user.getProfile().getAvatar() : null;
        return new MentionableUserResponse(
                user.getUsername(),
                user.getDisplayName(),
                avatar,
                user.getRole() == User.Role.ADMIN);
    }
}
