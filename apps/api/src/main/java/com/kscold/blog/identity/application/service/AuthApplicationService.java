package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.adapter.out.mail.RecoveryEmailComposer;
import com.kscold.blog.identity.adapter.out.mail.RecoveryMailProperties;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.LoginCommand;
import com.kscold.blog.identity.application.dto.PasswordResetTokenStatus;
import com.kscold.blog.identity.application.dto.RegisterCommand;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
import com.kscold.blog.identity.application.port.out.TokenProvider;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthApplicationService implements AuthUseCase {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final RecoveryMailSender recoveryMailSender;
    private final RecoveryEmailComposer recoveryEmailComposer;
    private final RecoveryMailProperties recoveryMailProperties;

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
        sendWelcomeMailSafely(user);

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

    @Override
    public void sendUsernameReminder(String email) {
        ensureRecoveryMailConfigured();

        userRepository.findByEmail(normalizeEmail(email))
                .ifPresent(user -> recoveryMailSender.send(recoveryEmailComposer.buildUsernameReminder(user)));
    }

    @Override
    public void requestPasswordReset(String email) {
        ensureRecoveryMailConfigured();

        userRepository.findByEmail(normalizeEmail(email))
                .ifPresent(this::sendPasswordResetMail);
    }

    @Override
    public PasswordResetTokenStatus validatePasswordResetToken(String token) {
        if (token == null || token.isBlank()) {
            return new PasswordResetTokenStatus(false, "재설정 링크를 다시 확인해주세요.", null);
        }

        return passwordResetTokenRepository.findByTokenHash(hashToken(token))
                .filter(savedToken -> !savedToken.isExpired(Instant.now()))
                .map(savedToken -> new PasswordResetTokenStatus(true, "유효한 재설정 링크입니다.", savedToken.getExpiresAt()))
                .orElseGet(() -> new PasswordResetTokenStatus(false, "만료되었거나 유효하지 않은 링크입니다.", null));
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw InvalidRequestException.invalidInput("재설정 링크를 다시 확인해주세요.");
        }

        PasswordResetToken savedToken = passwordResetTokenRepository.findByTokenHash(hashToken(token))
                .orElseThrow(() -> InvalidRequestException.invalidInput("만료되었거나 유효하지 않은 링크입니다."));

        if (savedToken.isExpired(Instant.now())) {
            passwordResetTokenRepository.deleteByUserId(savedToken.getUserId());
            throw InvalidRequestException.invalidInput("만료되었거나 유효하지 않은 링크입니다.");
        }

        User user = userRepository.findById(savedToken.getUserId())
                .orElseThrow(() -> ResourceNotFoundException.user(savedToken.getUserId()));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.deleteByUserId(user.getId());
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

    private void sendPasswordResetMail(User user) {
        passwordResetTokenRepository.deleteByUserId(user.getId());

        String rawToken = generateRawToken();
        Instant expiresAt = Instant.now().plusSeconds(recoveryMailProperties.getPasswordResetExpiryMinutes() * 60);
        PasswordResetToken savedToken = PasswordResetToken.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .tokenHash(hashToken(rawToken))
                .createdAt(Instant.now())
                .expiresAt(expiresAt)
                .build();

        passwordResetTokenRepository.save(savedToken);

        String resetUrl = recoveryMailProperties.resolvePublicUrl("/login/reset-password?token=" + rawToken);
        recoveryMailSender.send(recoveryEmailComposer.buildPasswordReset(user, resetUrl));
    }

    private void ensureRecoveryMailConfigured() {
        if (!recoveryMailSender.isAvailable()) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "이메일 발송 설정이 아직 준비되지 않았습니다. SMTP 설정을 확인해주세요."
            );
        }
    }

    private void sendWelcomeMailSafely(User user) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            recoveryMailSender.send(recoveryEmailComposer.buildWelcome(user));
        } catch (Exception exception) {
            log.warn("Welcome email delivery skipped for {}", user.getEmail(), exception);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim();
    }

    private String generateRawToken() {
        byte[] randomBytes = new byte[32];
        new java.security.SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, exception);
        }
    }
}
