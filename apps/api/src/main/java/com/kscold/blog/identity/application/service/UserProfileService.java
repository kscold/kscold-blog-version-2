package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.UpdateProfileCommand;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService implements UserProfileUseCase {

    private final UserRepository userRepository;

    @Override
    public AuthResult.UserInfo updateMyProfile(String userId, UpdateProfileCommand command) {
        return applyProfileUpdate(userId, command);
    }

    @Override
    public AuthResult.UserInfo updateUserProfile(String targetUserId, UpdateProfileCommand command) {
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

    private AuthResult.UserInfo applyProfileUpdate(String userId, UpdateProfileCommand command) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        User.Profile existing = user.getProfile();
        List<String> techStack = command.techStack() != null
                ? command.techStack().stream().map(String::trim).filter(s -> !s.isBlank()).distinct().collect(Collectors.toList())
                : (existing != null ? existing.getTechStack() : new ArrayList<>());

        User.Profile updated = User.Profile.builder()
                .displayName(command.displayName() != null ? command.displayName().trim() : (existing != null ? existing.getDisplayName() : null))
                .bio(command.bio() != null ? command.bio().trim() : (existing != null ? existing.getBio() : null))
                .avatar(command.avatar() != null ? command.avatar() : (existing != null ? existing.getAvatar() : null))
                .socialLinks(command.socialLinks() != null ? command.socialLinks() : (existing != null ? existing.getSocialLinks() : null))
                .techStack(techStack)
                .build();

        user.setProfile(updated);
        userRepository.save(user);
        return AuthResult.UserInfo.from(user);
    }
}
