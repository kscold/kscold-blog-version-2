package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.DuplicateResourceException;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationChannel;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
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
    private final PasswordEncoder passwordEncoder;
    private final TokenProvider tokenProvider;
    private final MailSender recoveryMailSender;
    private final RecoveryMailComposer recoveryEmailComposer;
    private final NotificationUseCase notificationUseCase;
    private final AccountRecoveryApplicationService accountRecoveryApplicationService;

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
        accountRecoveryApplicationService.sendUsernameReminder(email);
    }

    @Override
    public void requestPasswordReset(String email) {
        accountRecoveryApplicationService.requestPasswordReset(email);
    }

    @Override
    public PasswordResetTokenResponse validatePasswordResetToken(String token) {
        return accountRecoveryApplicationService.validatePasswordResetToken(token);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        accountRecoveryApplicationService.resetPassword(token, newPassword);
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

    private InvalidRequestException invalidRefreshToken() {
        return InvalidRequestException.invalidInput("유효하지 않은 리프레시 토큰입니다");
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
}
