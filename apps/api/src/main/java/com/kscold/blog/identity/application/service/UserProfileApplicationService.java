package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.command.UpdateProfileCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PublicProfileResponse;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileApplicationService implements UserProfileUseCase {

    private final UserRepository userRepository;

    @Override
    public AuthResponse.UserInfo updateMyProfile(String userId, UpdateProfileCommand command) {
        return applyProfileUpdate(userId, command);
    }

    @Override
    public AuthResponse.UserInfo updateUserProfile(
            String targetUserId, UpdateProfileCommand command) {
        return applyProfileUpdate(targetUserId, command);
    }

    @Override
    public List<String> getAllTechStacks() {
        return userRepository.findAllOrderByCreatedAtDesc().stream()
                .map(User::getProfile)
                .filter(p -> p != null && p.getTechStack() != null)
                .flatMap(p -> p.getTechStack().stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public PublicProfileResponse getPublicProfile(String username) {
        User user =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() -> ResourceNotFoundException.user(username));
        return PublicProfileResponse.from(user);
    }

    private AuthResponse.UserInfo applyProfileUpdate(String userId, UpdateProfileCommand command) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> ResourceNotFoundException.user(userId));

        User.Profile existing = user.getProfile();
        List<String> techStack =
                command.getTechStack() != null
                        ? command.getTechStack().stream()
                                .map(String::trim)
                                .filter(s -> !s.isBlank())
                                .distinct()
                                .collect(Collectors.toList())
                        : (existing != null ? existing.getTechStack() : new ArrayList<>());

        User.Profile updated =
                User.Profile.builder()
                        .displayName(
                                command.getDisplayName() != null
                                        ? command.getDisplayName().trim()
                                        : (existing != null ? existing.getDisplayName() : null))
                        .bio(
                                command.getBio() != null
                                        ? command.getBio().trim()
                                        : (existing != null ? existing.getBio() : null))
                        .avatar(
                                command.getAvatar() != null
                                        ? command.getAvatar()
                                        : (existing != null ? existing.getAvatar() : null))
                        .socialLinks(
                                command.getSocialLinks() != null
                                        ? command.getSocialLinks()
                                        : (existing != null ? existing.getSocialLinks() : null))
                        .techStack(techStack)
                        .build();

        user.setProfile(updated);
        userRepository.save(user);
        return AuthResponse.UserInfo.from(user);
    }
}
