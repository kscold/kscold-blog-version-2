package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import com.kscold.blog.support.UserFixtures;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthApplicationServiceTest {

    @Mock private UserRepository userRepository;

    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock private PasswordEncoder passwordEncoder;

    @Mock private TokenProvider tokenProvider;

    @Mock private MailSender recoveryMailSender;

    @Mock private RecoveryMailComposer recoveryEmailComposer;

    @Mock private PublicUrlResolver recoveryMailProperties;

    @Mock private PasswordResetSettings passwordResetSettings;

    @InjectMocks private AuthApplicationService authApplicationService;

    @Test
    @DisplayName("시나리오: 비활성 계정은 리프레시 토큰으로 세션을 연장할 수 없다")
    void refreshRejectsDeletedUser() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        user.setDeletedAt(LocalDateTime.now());
        when(tokenProvider.validateRefreshToken("refresh-token")).thenReturn(true);
        when(tokenProvider.getUserIdFromRefreshToken("refresh-token")).thenReturn("user-1");
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authApplicationService.refresh("refresh-token"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("비활성화된 계정");
        verify(tokenProvider, never()).createAccessToken(any(), any());
        verify(tokenProvider, never()).createRefreshToken(any(), any());
    }

    @Test
    @DisplayName("시나리오: 비활성 계정은 내 정보를 조회할 수 없다")
    void getMeRejectsDeletedUser() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        user.setDeletedAt(LocalDateTime.now());
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authApplicationService.getMe("user-1"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("비활성화된 계정");
    }

    @Test
    @DisplayName("시나리오: 회원가입이 완료되면 폼 흐름을 깨지 않고 환영 메일을 보낸다")
    void registerSendsWelcomeMailWithoutBlockingSignup() {
        RegisterCommand command =
                new RegisterCommand("hello@example.com", "hello", "password-123", "헬로");
        MailMessage welcomeMail =
                new MailMessage(command.getEmail(), "[KSCOLD] 가입을 환영합니다", "plain", "<html></html>");

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(userRepository.count()).thenReturn(1L);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId("user-1");
                            return user;
                        });
        when(tokenProvider.createAccessToken("user-1", "USER")).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER")).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(recoveryEmailComposer.buildWelcome(any(User.class))).thenReturn(welcomeMail);

        AuthResponse result = authApplicationService.register(command);

        assertThat(result.getUser().getEmail()).isEqualTo(command.getEmail());
        verify(recoveryMailSender).send(welcomeMail);
    }

    @Test
    @DisplayName("시나리오: 아이디 찾기는 가입한 이메일이 있으면 안내 메일을 보낸다")
    void sendUsernameReminderDeliversMailForExistingUser() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        MailMessage mailMessage =
                new MailMessage(user.getEmail(), "[KSCOLD] 가입 아이디 안내", "plain", "<html></html>");

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
        MailMessage mailMessage =
                new MailMessage(user.getEmail(), "[KSCOLD] 비밀번호 재설정 안내", "plain", "<html></html>");

        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(passwordResetSettings.getPasswordResetExpiryMinutes()).thenReturn(30L);
        when(recoveryMailProperties.resolvePublicUrl(startsWith("/login/reset-password?token=")))
                .thenAnswer(
                        invocation ->
                                "https://kscold.com" + invocation.getArgument(0, String.class));
        when(userRepository.findByEmail("kscold@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(recoveryEmailComposer.buildPasswordReset(
                        eq(user), startsWith("https://kscold.com/login/reset-password?token=")))
                .thenReturn(mailMessage);

        authApplicationService.requestPasswordReset("kscold@example.com");

        ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
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
    @DisplayName("시나리오: 미가입 이메일도 계정 존재 여부를 드러내지 않고 동일하게 처리한다")
    void requestPasswordResetDoesNotRevealMissingAccount() {
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        authApplicationService.requestPasswordReset("missing@example.com");

        verify(passwordResetTokenRepository, never()).save(any());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: 유효한 재설정 링크로 비밀번호를 바꾸면 저장된 토큰이 함께 정리된다")
    void resetPasswordUpdatesUserAndDeletesToken() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        user.setPassword("encoded-old");
        String rawToken = "valid-reset-token";
        PasswordResetToken savedToken =
                PasswordResetToken.builder()
                        .userId("user-1")
                        .email("kscold@example.com")
                        .tokenHash(hash(rawToken))
                        .createdAt(Instant.now())
                        .expiresAt(Instant.now().plusSeconds(600))
                        .build();

        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(savedToken));
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
        RegisterCommand command =
                new RegisterCommand("hello@example.com", "hello", "password-123", "헬로");

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(userRepository.count()).thenReturn(1L);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId("user-1");
                            return user;
                        });
        when(tokenProvider.createAccessToken("user-1", "USER")).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER")).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        AuthResponse result = authApplicationService.register(command);

        assertThat(result.getUser().getUsername()).isEqualTo(command.getUsername());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: 만료된 재설정 링크는 유효하지 않은 상태로 표시된다")
    void validatePasswordResetTokenReturnsInvalidForExpiredToken() {
        String rawToken = "expired-token";
        PasswordResetToken savedToken =
                PasswordResetToken.builder()
                        .userId("user-1")
                        .tokenHash(hash(rawToken))
                        .createdAt(Instant.now().minusSeconds(3600))
                        .expiresAt(Instant.now().minusSeconds(60))
                        .build();

        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(savedToken));

        PasswordResetTokenResponse status =
                authApplicationService.validatePasswordResetToken(rawToken);

        assertThat(status.isValid()).isFalse();
        assertThat(status.getMessage()).contains("만료");
    }

    @Test
    @DisplayName("시나리오: 과도하게 긴 재설정 토큰은 저장소를 조회하지 않는다")
    void validatePasswordResetTokenRejectsOversizedTokenBeforeLookup() {
        String oversizedToken = "a".repeat(ResetPasswordCommand.MAX_TOKEN_LENGTH + 1);

        PasswordResetTokenResponse status =
                authApplicationService.validatePasswordResetToken(oversizedToken);

        assertThat(status.isValid()).isFalse();
        verify(passwordResetTokenRepository, never()).findByTokenHash(any());
    }

    private static String hash(String rawToken) {
        try {
            byte[] hash =
                    MessageDigest.getInstance("SHA-256")
                            .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}
