package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.command.UpdateProfileCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PublicProfileResponse;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileApplicationService implements UserProfileUseCase {

    private static final Set<String> SUPPORTED_SOCIAL_LINKS =
            Set.of("github", "instagram", "linkedin", "website", "twitter", "threads");

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
                        ? normalizeTechStack(command.getTechStack())
                        : (existing != null ? existing.getTechStack() : new ArrayList<>());

        User.Profile updated =
                User.Profile.builder()
                        .displayName(
                                command.getDisplayName() != null
                                        ? normalizeOptionalText(
                                                command.getDisplayName(),
                                                UpdateProfileCommand.DISPLAY_NAME_MAX_LENGTH)
                                        : (existing != null ? existing.getDisplayName() : null))
                        .bio(
                                command.getBio() != null
                                        ? normalizeOptionalText(
                                                command.getBio(),
                                                UpdateProfileCommand.BIO_MAX_LENGTH)
                                        : (existing != null ? existing.getBio() : null))
                        .avatar(
                                command.getAvatar() != null
                                        ? normalizeWebUrl(command.getAvatar(), true)
                                        : (existing != null ? existing.getAvatar() : null))
                        .socialLinks(
                                command.getSocialLinks() != null
                                        ? normalizeSocialLinks(command.getSocialLinks())
                                        : (existing != null ? existing.getSocialLinks() : null))
                        .techStack(techStack)
                        .build();

        user.setProfile(updated);
        userRepository.save(user);
        return AuthResponse.UserInfo.from(user);
    }

    private List<String> normalizeTechStack(List<String> values) {
        if (values.size() > UpdateProfileCommand.TECH_STACK_MAX_COUNT) {
            throw InvalidRequestException.invalidInput("기술 스택이 너무 많습니다");
        }
        return values.stream()
                .map(value -> requireText(value, UpdateProfileCommand.TECH_STACK_ITEM_MAX_LENGTH))
                .distinct()
                .collect(Collectors.toList());
    }

    private Map<String, String> normalizeSocialLinks(Map<String, String> values) {
        if (values.size() > UpdateProfileCommand.SOCIAL_LINK_MAX_COUNT) {
            throw InvalidRequestException.invalidInput("소셜 링크가 너무 많습니다");
        }

        Map<String, String> normalized = new LinkedHashMap<>();
        values.forEach(
                (key, value) -> {
                    if (key == null || !SUPPORTED_SOCIAL_LINKS.contains(key)) {
                        throw InvalidRequestException.invalidInput("지원하지 않는 소셜 링크입니다");
                    }
                    normalized.put(
                            key,
                            normalizeWebUrl(
                                    requireText(value, UpdateProfileCommand.URL_MAX_LENGTH),
                                    false));
                });
        return normalized;
    }

    private String normalizeWebUrl(String value, boolean httpsOnly) {
        String normalized = normalizeOptionalText(value, UpdateProfileCommand.URL_MAX_LENGTH);
        if (normalized == null) {
            return null;
        }

        try {
            URI uri = new URI(normalized);
            String scheme = uri.getScheme();
            boolean supportedScheme =
                    scheme != null
                            && (scheme.equalsIgnoreCase("https")
                                    || (!httpsOnly && scheme.equalsIgnoreCase("http")));
            if (!supportedScheme || uri.getHost() == null || uri.getUserInfo() != null) {
                throw InvalidRequestException.invalidInput("웹 주소 형식이 올바르지 않습니다");
            }
            return normalized;
        } catch (URISyntaxException exception) {
            throw InvalidRequestException.invalidInput("웹 주소 형식이 올바르지 않습니다");
        }
    }

    private String normalizeOptionalText(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return requireText(value, maxLength);
    }

    private String requireText(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            throw InvalidRequestException.invalidInput("빈 입력값은 저장할 수 없습니다");
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw InvalidRequestException.invalidInput("입력값이 너무 깁니다");
        }
        return normalized;
    }
}
