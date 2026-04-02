package com.kscold.blog.support;

import com.kscold.blog.identity.domain.model.User;

public final class UserFixtures {

    private UserFixtures() {
    }

    public static User user(String id, User.Role role, String username, String displayName) {
        return User.builder()
                .id(id)
                .email(username + "@example.com")
                .username(username)
                .role(role)
                .profile(User.Profile.builder()
                        .displayName(displayName)
                        .build())
                .build();
    }
}
