package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserQueryApplicationService implements UserQueryPort {

    private final UserRepository userRepository;

    @Override
    public UserInfo getUserById(String userId) {
        User user =
                userRepository
                        .findById(userId)
                        .filter(candidate -> !candidate.isDeleted())
                        .orElseThrow(() -> ResourceNotFoundException.user(userId));

        return toUserInfo(user);
    }

    @Override
    public Map<String, UserInfo> getUsersByIds(Collection<String> userIds) {
        Map<String, UserInfo> users = new LinkedHashMap<>();
        userRepository
                .findAllById(userIds)
                .forEach(user -> users.put(user.getId(), toUserInfo(user)));
        return users;
    }

    private UserInfo toUserInfo(User user) {
        String avatar = user.getProfile() != null ? user.getProfile().getAvatar() : null;

        return new UserInfo(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                avatar,
                user.getRole() == User.Role.ADMIN,
                user.getEmail());
    }
}
