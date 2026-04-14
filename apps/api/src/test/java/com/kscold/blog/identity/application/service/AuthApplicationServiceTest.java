package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.identity.adapter.out.mail.RecoveryEmailComposer;
import com.kscold.blog.identity.adapter.out.mail.RecoveryMailProperties;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.RegisterCommand;
import com.kscold.blog.identity.application.dto.PasswordResetTokenStatus;
import com.kscold.blog.identity.application.port.out.RecoveryMailMessage;
import com.kscold.blog.identity.application.port.out.RecoveryMailSender;
import com.kscold.blog.identity.application.port.out.TokenProvider;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.support.UserFixtures;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthApplicationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private TokenProvider tokenProvider;

    @Mock
    private RecoveryMailSender recoveryMailSender;

    @Mock
    private RecoveryEmailComposer recoveryEmailComposer;

    @Mock
    private RecoveryMailProperties recoveryMailProperties;

    @InjectMocks
    private AuthApplicationService authApplicationService;

    @Test
    @DisplayName("시나리오: 회원가입이 완료되면 폼 흐름을 깨지 않고 환영 메일을 보낸다")
    void registerSendsWelcomeMailWithoutBlockingSignup() {
        RegisterCommand command = new RegisterCommand(
                "hello@example.com",
                "hello",
                "password-123",
                "헬로"
        );
        RecoveryMailMessage welcomeMail = new RecoveryMailMessage(
                command.getEmail(),
                "[KSCOLD] 가입을 환영합니다",
                "plain",
                "<html></html>"
        );

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(userRepository.count()).thenReturn(1L);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("user-1");
            return user;
        });
        when(tokenProvider.createAccessToken("user-1", "USER")).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER")).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(recoveryEmailComposer.buildWelcome(any(User.class))).thenReturn(welcomeMail);

        AuthResult result = authApplicationService.register(command);

        assertThat(result.getUser().getEmail()).isEqualTo(command.getEmail());
        verify(recoveryMailSender).send(welcomeMail);
    }

    @Test
    @DisplayName("시나리오: 아이디 찾기는 가입한 이메일이 있으면 안내 메일을 보낸다")
    void sendUsernameReminderDeliversMailForExistingUser() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        RecoveryMailMessage mailMessage = new RecoveryMailMessage(
                user.getEmail(),
                "[KSCOLD] 가입 아이디 안내",
                "plain",
                "<html></html>"
        );

        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(userRepository.findByEmail("kscold@example.com")).thenReturn(Optional.of(user));
        when(recoveryEmailComposer.buildUsernameReminder(user)).thenReturn(mailMessage);

        authApplicationService.sendUsernameReminder("kscold@example.com");

        verify(recoveryMailSender).send(mailMessage);
    }

    @Test
    @DisplayName("시나리오: 비밀번호 재설정 요청은 새 토큰을 저장하고 메일을 보낸다")
    void requestPasswordResetStoresTokenAndSendsMail() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        RecoveryMailMessage mailMessage = new RecoveryMailMessage(
                user.getEmail(),
                "[KSCOLD] 비밀번호 재설정 안내",
                "plain",
                "<html></html>"
        );

        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(recoveryMailProperties.getPasswordResetExpiryMinutes()).thenReturn(30L);
        when(recoveryMailProperties.resolvePublicUrl(startsWith("/login/reset-password?token=")))
                .thenAnswer(invocation -> "https://kscold.com" + invocation.getArgument(0, String.class));
        when(userRepository.findByEmail("kscold@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(recoveryEmailComposer.buildPasswordReset(eq(user), startsWith("https://kscold.com/login/reset-password?token=")))
                .thenReturn(mailMessage);

        authApplicationService.requestPasswordReset("kscold@example.com");

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        verify(recoveryMailSender).send(mailMessage);

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getUserId()).isEqualTo("user-1");
        assertThat(savedToken.getEmail()).isEqualTo("kscold@example.com");
        assertThat(savedToken.getTokenHash()).isNotBlank();
        assertThat(savedToken.getExpiresAt()).isAfter(savedToken.getCreatedAt());
    }

    @Test
    @DisplayName("시나리오: 유효한 재설정 링크로 비밀번호를 바꾸면 저장된 토큰이 함께 정리된다")
    void resetPasswordUpdatesUserAndDeletesToken() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        user.setPassword("encoded-old");
        String rawToken = "valid-reset-token";
        PasswordResetToken savedToken = PasswordResetToken.builder()
                .userId("user-1")
                .email("kscold@example.com")
                .tokenHash(hash(rawToken))
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(600))
                .build();

        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken))).thenReturn(Optional.of(savedToken));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-password-123")).thenReturn("encoded-new");

        authApplicationService.resetPassword(rawToken, "new-password-123");

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        verify(userRepository).save(user);
        verify(passwordResetTokenRepository).deleteByUserId("user-1");
    }

    @Test
    @DisplayName("시나리오: SMTP 설정이 없으면 복구 메일 요청은 같은 안내 오류를 반환한다")
    void recoveryRejectsWhenMailSenderUnavailable() {
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        assertThatThrownBy(() -> authApplicationService.requestPasswordReset("kscold@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SMTP 설정");

        assertThatThrownBy(() -> authApplicationService.sendUsernameReminder("kscold@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SMTP 설정");
    }

    @Test
    @DisplayName("시나리오: SMTP가 없어도 회원가입 자체는 완료된다")
    void registerCompletesWithoutMailSender() {
        RegisterCommand command = new RegisterCommand(
                "hello@example.com",
                "hello",
                "password-123",
                "헬로"
        );

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(userRepository.count()).thenReturn(1L);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId("user-1");
            return user;
        });
        when(tokenProvider.createAccessToken("user-1", "USER")).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER")).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        AuthResult result = authApplicationService.register(command);

        assertThat(result.getUser().getUsername()).isEqualTo(command.getUsername());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: 만료된 재설정 링크는 유효하지 않은 상태로 표시된다")
    void validatePasswordResetTokenReturnsInvalidForExpiredToken() {
        String rawToken = "expired-token";
        PasswordResetToken savedToken = PasswordResetToken.builder()
                .userId("user-1")
                .tokenHash(hash(rawToken))
                .createdAt(Instant.now().minusSeconds(3600))
                .expiresAt(Instant.now().minusSeconds(60))
                .build();

        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken))).thenReturn(Optional.of(savedToken));

        PasswordResetTokenStatus status = authApplicationService.validatePasswordResetToken(rawToken);

        assertThat(status.valid()).isFalse();
        assertThat(status.message()).contains("만료");
    }

    private static String hash(String rawToken) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
