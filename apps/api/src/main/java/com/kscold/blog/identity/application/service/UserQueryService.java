package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.port.in.UserQueryPort;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserQueryService implements UserQueryPort {

    private final UserRepository userRepository;

    @Override
    public UserInfo getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        String avatar = user.getProfile() != null ? user.getProfile().getAvatar() : null;

        return new UserInfo(user.getId(), user.getDisplayName(), avatar);
    }
}
