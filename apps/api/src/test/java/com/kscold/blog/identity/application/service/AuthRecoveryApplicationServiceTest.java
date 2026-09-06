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
import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import com.kscold.blog.support.UserFixtures;
import java.time.Instant;
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
class AuthRecoveryApplicationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private TokenProvider tokenProvider;
    @Mock private MailSender recoveryMailSender;
    @Mock private RecoveryMailComposer recoveryEmailComposer;
    @Mock private PublicUrlResolver recoveryMailProperties;
    @Mock private PasswordResetSettings passwordResetSettings;
    @Mock private NotificationUseCase notificationUseCase;

    @InjectMocks private AuthApplicationService authApplicationService;

    @Test
    @DisplayName("시나리오: 활성 계정은 아이디 안내 메일을 받는다")
    void sendUsernameReminderDeliversMailForActiveUser() {
        User user = activeUser();
        MailMessage mail = mailFor(user, "가입 아이디 안내");
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(userRepository.findActiveByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(recoveryEmailComposer.buildUsernameReminder(user)).thenReturn(mail);

        authApplicationService.sendUsernameReminder(user.getEmail());

        verify(recoveryMailSender).send(mail);
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정에는 아이디 안내 메일을 보내지 않는다")
    void sendUsernameReminderIgnoresInactiveAccount() {
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(userRepository.findActiveByEmail("deleted@example.com")).thenReturn(Optional.empty());

        authApplicationService.sendUsernameReminder("deleted@example.com");

        verify(recoveryEmailComposer, never()).buildUsernameReminder(any());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: 활성 계정의 재설정 요청은 새 토큰을 저장하고 메일을 보낸다")
    void requestPasswordResetStoresTokenForActiveUser() {
        User user = activeUser();
        MailMessage mail = mailFor(user, "비밀번호 재설정 안내");
        stubRecoveryMail(user, mail);

        authApplicationService.requestPasswordReset(user.getEmail());

        ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).deleteByUserId(user.getId());
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        verify(recoveryMailSender).send(mail);
        assertThat(tokenCaptor.getValue().getTokenHash()).isNotBlank();
        assertThat(tokenCaptor.getValue().getExpiresAt())
                .isAfter(tokenCaptor.getValue().getCreatedAt());
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정의 재설정 요청은 흔적을 만들지 않는다")
    void requestPasswordResetIgnoresInactiveAccount() {
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(userRepository.findActiveByEmail("deleted@example.com")).thenReturn(Optional.empty());

        authApplicationService.requestPasswordReset("deleted@example.com");

        verify(passwordResetTokenRepository, never()).deleteByUserId(any());
        verify(passwordResetTokenRepository, never()).save(any());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: SMTP 설정이 없으면 복구 요청은 같은 안내 오류를 반환한다")
    void recoveryRejectsWhenMailSenderUnavailable() {
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        assertThatThrownBy(() -> authApplicationService.requestPasswordReset("user@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SMTP 설정");
        assertThatThrownBy(() -> authApplicationService.sendUsernameReminder("user@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SMTP 설정");
    }

    @Test
    @DisplayName("시나리오: 활성 계정 소유자의 재설정 링크만 유효하다")
    void validatePasswordResetTokenRequiresActiveOwner() {
        String rawToken = "valid-reset-token";
        PasswordResetToken savedToken = validToken(rawToken);
        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(savedToken));
        when(userRepository.findActiveById("user-1")).thenReturn(Optional.of(activeUser()));

        PasswordResetTokenResponse status =
                authApplicationService.validatePasswordResetToken(rawToken);

        assertThat(status.isValid()).isTrue();
        assertThat(status.getExpiresAt()).isEqualTo(savedToken.getExpiresAt());
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정 소유자의 재설정 링크는 무효하다")
    void validatePasswordResetTokenRejectsInactiveOwner() {
        String rawToken = "orphan-reset-token";
        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(validToken(rawToken)));
        when(userRepository.findActiveById("user-1")).thenReturn(Optional.empty());

        PasswordResetTokenResponse status =
                authApplicationService.validatePasswordResetToken(rawToken);

        assertThat(status.isValid()).isFalse();
        assertThat(status.getExpiresAt()).isNull();
    }

    @Test
    @DisplayName("시나리오: 만료된 재설정 링크는 계정 상태를 조회하지 않는다")
    void validatePasswordResetTokenRejectsExpiredToken() {
        String expiredToken = "expired-token";
        PasswordResetToken expired = validToken(expiredToken);
        expired.setExpiresAt(Instant.now().minusSeconds(60));
        when(passwordResetTokenRepository.findByTokenHash(hash(expiredToken)))
                .thenReturn(Optional.of(expired));

        assertThat(authApplicationService.validatePasswordResetToken(expiredToken).isValid())
                .isFalse();
        verify(userRepository, never()).findActiveById(any());
    }

    @Test
    @DisplayName("시나리오: 과도하게 긴 재설정 링크는 토큰 저장소를 조회하지 않는다")
    void validatePasswordResetTokenRejectsOversizedToken() {
        String oversized = "a".repeat(ResetPasswordCommand.MAX_TOKEN_LENGTH + 1);

        assertThat(authApplicationService.validatePasswordResetToken(oversized).isValid())
                .isFalse();
        verify(passwordResetTokenRepository, never()).findByTokenHash(any());
    }

    @Test
    @DisplayName("시나리오: 활성 계정의 재설정 링크로 비밀번호를 바꾸면 토큰을 정리한다")
    void resetPasswordUpdatesActiveUser() {
        String rawToken = "valid-reset-token";
        when(passwordResetTokenRepository.consumeByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(validToken(rawToken)));
        when(passwordEncoder.encode("new-password-123")).thenReturn("encoded-new");
        when(userRepository.updatePasswordIfActive("user-1", "encoded-new")).thenReturn(true);

        authApplicationService.resetPassword(rawToken, "new-password-123");

        verify(userRepository).updatePasswordIfActive("user-1", "encoded-new");
        verify(userRepository, never()).save(any());
        verify(passwordResetTokenRepository).deleteByUserId("user-1");
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정의 재설정 링크는 폐기한다")
    void resetPasswordRejectsInactiveOwner() {
        String rawToken = "orphan-reset-token";
        when(passwordResetTokenRepository.consumeByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(validToken(rawToken)));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new");
        when(userRepository.updatePasswordIfActive("user-1", "encoded-new")).thenReturn(false);

        assertThatThrownBy(() -> authApplicationService.resetPassword(rawToken, "new-password"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("유효하지 않은 링크");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userRepository).updatePasswordIfActive("user-1", "encoded-new");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("시나리오: 만료된 재설정 링크도 한 번 소비한 뒤 거절한다")
    void resetPasswordConsumesExpiredToken() {
        String rawToken = "expired-token";
        PasswordResetToken expired = validToken(rawToken);
        expired.setExpiresAt(Instant.now().minusSeconds(60));
        when(passwordResetTokenRepository.consumeByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> authApplicationService.resetPassword(rawToken, "new-password"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("유효하지 않은 링크");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).updatePasswordIfActive(any(), any());
    }

    private void stubRecoveryMail(User user, MailMessage mail) {
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(passwordResetSettings.getPasswordResetExpiryMinutes()).thenReturn(30L);
        when(recoveryMailProperties.resolvePublicUrl(startsWith("/login/reset-password?token=")))
                .thenAnswer(invocation -> "https://kscold.com" + invocation.getArgument(0));
        when(userRepository.findActiveByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(recoveryEmailComposer.buildPasswordReset(
                        eq(user), startsWith("https://kscold.com/login/reset-password?token=")))
                .thenReturn(mail);
    }

    private User activeUser() {
        return UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
    }

    private PasswordResetToken validToken(String rawToken) {
        return PasswordResetToken.builder()
                .userId("user-1")
                .email("kscold@example.com")
                .tokenHash(hash(rawToken))
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(600))
                .build();
    }

    private MailMessage mailFor(User user, String subject) {
        return new MailMessage(user.getEmail(), subject, "plain", "<html></html>");
    }

    private static String hash(String rawToken) {
        return PasswordResetTokenCodec.hash(rawToken);
    }
}
