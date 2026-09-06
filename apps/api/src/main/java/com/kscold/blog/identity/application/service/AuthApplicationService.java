package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.identity.domain.port.out.UserSessionRevocationPort;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import java.time.Instant;
import java.util.List;
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
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final MailSender recoveryMailSender;
    private final RecoveryMailComposer recoveryEmailComposer;
    private final PublicUrlResolver recoveryMailProperties;
    private final PasswordResetSettings passwordResetSettings;
    private final NotificationUseCase notificationUseCase;
    private final UserSessionRevocationPort userSessionRevocationPort;

    @Transactional
    public AuthResponse register(RegisterCommand command) {
        if (userRepository.existsByEmail(command.getEmail())) {
            throw DuplicateResourceException.email(command.getEmail());
        }
        if (userRepository.existsByUsername(command.getUsername())) {
            throw DuplicateResourceException.username(command.getUsername());
        }

        User user =
                User.builder()
                        .email(command.getEmail())
                        .username(command.getUsername())
                        .password(passwordEncoder.encode(command.getPassword()))
                        .credentialVersion(0L)
                        // 공개 회원가입은 데이터베이스 상태와 무관하게 최소 권한만 부여한다.
                        .role(User.Role.USER)
                        .profile(
                                User.Profile.builder()
                                        .displayName(
                                                command.getDisplayName() != null
                                                        ? command.getDisplayName()
                                                        : command.getUsername())
                                        .build())
                        .build();

        user = userRepository.save(user);
        sendWelcomeMailSafely(user);
        notifySignup(user);

        return buildAuthResult(user);
    }

    public AuthResponse login(LoginCommand command) {
        User user =
                userRepository
                        .findActiveByEmail(command.getEmail())
                        .orElseThrow(
                                () ->
                                        InvalidRequestException.invalidInput(
                                                "이메일 또는 비밀번호가 올바르지 않습니다"));

        if (!passwordEncoder.matches(command.getPassword(), user.getPassword())) {
            throw InvalidRequestException.invalidInput("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        return buildAuthResult(user);
    }

    public AuthResponse refresh(String refreshToken) {
        TokenIdentity tokenIdentity =
                tokenProvider
                        .parseRefreshToken(refreshToken)
                        .orElseThrow(this::invalidRefreshToken);
        User user = getActiveUser(tokenIdentity.userId());
        if (tokenIdentity.credentialVersion() != user.getCredentialVersion()) {
            throw invalidRefreshToken();
        }

        return buildAuthResult(user);
    }

    public AuthResponse.UserInfo getMe(String userId) {
        User user = getActiveUser(userId);

        return AuthResponse.UserInfo.from(user);
    }

    @Override
    public void sendUsernameReminder(String email) {
        ensureRecoveryMailConfigured();

        userRepository
                .findActiveByEmail(normalizeEmail(email))
                .ifPresent(
                        user ->
                                recoveryMailSender.send(
                                        recoveryEmailComposer.buildUsernameReminder(user)));
    }

    @Override
    public void requestPasswordReset(String email) {
        ensureRecoveryMailConfigured();

        userRepository
                .findActiveByEmail(normalizeEmail(email))
                .ifPresent(this::sendPasswordResetMail);
    }

    @Override
    public PasswordResetTokenResponse validatePasswordResetToken(String token) {
        if (!PasswordResetTokenCodec.isValidInput(token)) {
            return new PasswordResetTokenResponse(false, "재설정 링크를 다시 확인해주세요.", null);
        }

        return passwordResetTokenRepository
                .findByTokenHash(PasswordResetTokenCodec.hash(token))
                .filter(savedToken -> !savedToken.isExpired(Instant.now()))
                .filter(
                        savedToken ->
                                userRepository.findActiveById(savedToken.getUserId()).isPresent())
                .map(
                        savedToken ->
                                new PasswordResetTokenResponse(
                                        true, "유효한 재설정 링크입니다.", savedToken.getExpiresAt()))
                .orElseGet(
                        () -> new PasswordResetTokenResponse(false, "만료되었거나 유효하지 않은 링크입니다.", null));
    }

    @Override
    @Transactional(noRollbackFor = InvalidRequestException.class)
    public void resetPassword(String token, String newPassword) {
        if (!PasswordResetTokenCodec.isValidInput(token)) {
            throw InvalidRequestException.invalidInput("재설정 링크를 다시 확인해주세요.");
        }

        PasswordResetToken savedToken =
                passwordResetTokenRepository
                        .consumeByTokenHash(PasswordResetTokenCodec.hash(token))
                        .orElseThrow(
                                () ->
                                        InvalidRequestException.invalidInput(
                                                "만료되었거나 유효하지 않은 링크입니다."));

        if (savedToken.isExpired(Instant.now())) {
            throw InvalidRequestException.invalidInput("만료되었거나 유효하지 않은 링크입니다.");
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        if (!userRepository.updatePasswordIfActive(savedToken.getUserId(), encodedPassword)) {
            passwordResetTokenRepository.deleteByUserId(savedToken.getUserId());
            throw invalidResetLink();
        }
        revokeUserSessionsSafely(savedToken.getUserId());
        passwordResetTokenRepository.deleteByUserId(savedToken.getUserId());
    }

    private AuthResponse buildAuthResult(User user) {
        String role = user.getRole().name();
        long credentialVersion = user.getCredentialVersion();
        return AuthResponse.builder()
                .accessToken(tokenProvider.createAccessToken(user.getId(), role, credentialVersion))
                .refreshToken(
                        tokenProvider.createRefreshToken(user.getId(), role, credentialVersion))
                .tokenType("Bearer")
                .user(AuthResponse.UserInfo.from(user))
                .build();
    }

    private void revokeUserSessionsSafely(String userId) {
        try {
            userSessionRevocationPort.revokeUserSessions(userId);
        } catch (RuntimeException exception) {
            log.warn(
                    "WebSocket session revocation skipped: type={}",
                    exception.getClass().getSimpleName());
        }
    }

    private User getActiveUser(String userId) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() -> ResourceNotFoundException.user(userId));
        if (user.isDeleted()) {
            throw InvalidRequestException.invalidInput("비활성화된 계정입니다. 관리자에게 문의하세요");
        }
        return user;
    }

    private InvalidRequestException invalidResetLink() {
        return InvalidRequestException.invalidInput("만료되었거나 유효하지 않은 링크입니다.");
    }

    private InvalidRequestException invalidRefreshToken() {
        return InvalidRequestException.invalidInput("유효하지 않은 리프레시 토큰입니다");
    }

    private void sendPasswordResetMail(User user) {
        passwordResetTokenRepository.deleteByUserId(user.getId());

        String rawToken = PasswordResetTokenCodec.generate();
        Instant expiresAt =
                Instant.now()
                        .plusSeconds(passwordResetSettings.getPasswordResetExpiryMinutes() * 60);
        PasswordResetToken savedToken =
                PasswordResetToken.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .tokenHash(PasswordResetTokenCodec.hash(rawToken))
                        .createdAt(Instant.now())
                        .expiresAt(expiresAt)
                        .build();

        passwordResetTokenRepository.save(savedToken);

        String resetUrl =
                recoveryMailProperties.resolvePublicUrl("/login/reset-password?token=" + rawToken);
        recoveryMailSender.send(recoveryEmailComposer.buildPasswordReset(user, resetUrl));
    }

    private void ensureRecoveryMailConfigured() {
        if (!recoveryMailSender.isAvailable()) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR, "이메일 발송 설정이 아직 준비되지 않았습니다. SMTP 설정을 확인해주세요.");
        }
    }

    private void sendWelcomeMailSafely(User user) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            recoveryMailSender.send(recoveryEmailComposer.buildWelcome(user));
        } catch (Exception exception) {
            log.warn(
                    "Welcome email delivery skipped: type={}",
                    exception.getClass().getSimpleName());
        }
    }

    /** 신규 가입을 디스코드 알림 채널로 알림. 실패해도 가입 자체는 성공해야 하므로 예외를 삼킨다. */
    private void notifySignup(User user) {
        try {
            notificationUseCase.notify(
                    new NotificationMessage(
                            NotificationChannel.SIGNUP,
                            "새 회원이 가입했어요",
                            user.getDisplayName() + "님이 블로그에 가입했습니다.",
                            List.of(
                                    new NotificationMessage.Field("아이디", user.getUsername()),
                                    new NotificationMessage.Field("권한", user.getRole().name()))));
        } catch (Exception exception) {
            log.warn("회원가입 알림 전송을 건너뜁니다: type={}", exception.getClass().getSimpleName());
        }
    }

    private String normalizeEmail(String email) {
        return email.trim();
    }
}
