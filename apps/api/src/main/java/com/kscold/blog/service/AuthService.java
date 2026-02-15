package com.kscold.blog.service;

import com.kscold.blog.dto.request.LoginRequest;
import com.kscold.blog.dto.request.RegisterRequest;
import com.kscold.blog.dto.response.AuthResponse;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.User;
import com.kscold.blog.repository.UserRepository;
import com.kscold.blog.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw DuplicateResourceException.email(request.getEmail());
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw DuplicateResourceException.username(request.getUsername());
        }

        // 첫 사용자는 ADMIN으로 설정
        boolean isFirstUser = userRepository.count() == 0;

        // 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(isFirstUser ? User.Role.ADMIN : User.Role.USER)
                .profile(User.Profile.builder()
                        .displayName(request.getDisplayName() != null ? request.getDisplayName() : request.getUsername())
                        .build())
                .build();

        user = userRepository.save(user);

        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .displayName(user.getProfile().getDisplayName())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> InvalidRequestException.invalidInput("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw InvalidRequestException.invalidInput("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        String token = jwtTokenProvider.createToken(user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .username(user.getUsername())
                        .displayName(user.getProfile() != null ? user.getProfile().getDisplayName() : user.getUsername())
                        .role(user.getRole())
                        .build())
                .build();
    }

    public AuthResponse.UserInfo getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));

        return AuthResponse.UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .displayName(user.getProfile() != null ? user.getProfile().getDisplayName() : user.getUsername())
                .role(user.getRole())
                .build();
    }
}
