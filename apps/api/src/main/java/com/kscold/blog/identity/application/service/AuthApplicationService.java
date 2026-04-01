package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.LoginCommand;
import com.kscold.blog.identity.application.dto.RegisterCommand;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import com.kscold.blog.identity.application.port.out.TokenProvider;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthApplicationService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;

    @Transactional
    public AuthResult register(RegisterCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw DuplicateResourceException.email(command.getEmail());
        }
        if (userRepository.existsByUsername(command.getUsername())) {
            throw DuplicateResourceException.username(command.getUsername());
        }

        boolean isFirstUser = userRepository.count() == 0;

        User user = User.builder()
                .email(command.getEmail())
                .username(command.getUsername())
                .password(passwordEncoder.encode(command.getPassword()))
                .role(isFirstUser ? User.Role.ADMIN : User.Role.USER)
                .profile(User.Profile.builder()
                        .displayName(command.getDisplayName() != null ? command.getDisplayName() : command.getUsername())
                        .build())
                .build();

        user = userRepository.save(user);

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = tokenProvider.createRefreshToken(user.getId(), user.getRole().name());

        return buildAuthResult(user, accessToken, refreshToken);
    }

    public AuthResult login(LoginCommand command) {
        User user = userRepository.findByEmail(command.getEmail())
                .orElseThrow(() -> InvalidRequestException.invalidInput("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(command.getPassword(), user.getPassword())) {
            throw InvalidRequestException.invalidInput("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        String accessToken = tokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String refreshToken = tokenProvider.createRefreshToken(user.getId(), user.getRole().name());

        return buildAuthResult(user, accessToken, refreshToken);
    }

    public AuthResult refresh(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw InvalidRequestException.invalidInput("유효하지 않은 리프레시 토큰입니다");
        }

        String userId = tokenProvider.getUserIdFromRefreshToken(refreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        String newAccessToken = tokenProvider.createAccessToken(user.getId(), user.getRole().name());
        String newRefreshToken = tokenProvider.createRefreshToken(user.getId(), user.getRole().name());

        return buildAuthResult(user, newAccessToken, newRefreshToken);
    }

    public AuthResult.UserInfo getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        return AuthResult.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
    }

    private AuthResult buildAuthResult(User user, String accessToken, String refreshToken) {
        return AuthResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(AuthResult.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .displayName(user.getDisplayName())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
