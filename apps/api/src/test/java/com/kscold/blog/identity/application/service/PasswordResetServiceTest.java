package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.identity.domain.port.out.UserSessionRevocationPort;
import com.kscold.blog.support.UserFixtures;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserSessionRevocationPort userSessionRevocationPort;

    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        PasswordCredentialService credentialService =
                new PasswordCredentialService(
                        userRepository, passwordEncoder, userSessionRevocationPort);
        service =
                new PasswordResetService(
                        passwordResetTokenRepository, userRepository, credentialService);
    }

    @Test
    @DisplayName("시나리오: 활성 계정 소유자의 재설정 링크만 유효하다")
    void validateRequiresActiveOwner() {
        String rawToken = "valid-reset-token";
        PasswordResetToken savedToken = validToken(rawToken);
        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(savedToken));
        when(userRepository.findActiveById("user-1")).thenReturn(Optional.of(activeUser()));

        PasswordResetTokenResponse status = service.validate(rawToken);

        assertThat(status.isValid()).isTrue();
        assertThat(status.getExpiresAt()).isEqualTo(savedToken.getExpiresAt());
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정 소유자의 재설정 링크는 무효하다")
    void validateRejectsInactiveOwner() {
        String rawToken = "orphan-reset-token";
        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(validToken(rawToken)));
        when(userRepository.findActiveById("user-1")).thenReturn(Optional.empty());

        PasswordResetTokenResponse status = service.validate(rawToken);

        assertThat(status.isValid()).isFalse();
        assertThat(status.getExpiresAt()).isNull();
    }

    @Test
    @DisplayName("시나리오: 만료된 링크는 계정 상태를 조회하지 않는다")
    void validateRejectsExpiredTokenBeforeOwnerLookup() {
        String rawToken = "expired-token";
        PasswordResetToken expired = validToken(rawToken);
        expired.setExpiresAt(Instant.now().minusSeconds(60));
        when(passwordResetTokenRepository.findByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(expired));

        assertThat(service.validate(rawToken).isValid()).isFalse();
        verify(userRepository, never()).findActiveById(any());
    }

    @Test
    @DisplayName("시나리오: 과도하게 긴 링크는 토큰 저장소를 조회하지 않는다")
    void validateRejectsOversizedTokenWithoutLookup() {
        String oversized = "a".repeat(ResetPasswordCommand.MAX_TOKEN_LENGTH + 1);

        assertThat(service.validate(oversized).isValid()).isFalse();
        verify(passwordResetTokenRepository, never()).findByTokenHash(any());
    }

    @Test
    @DisplayName("시나리오: 활성 계정의 비밀번호 갱신 후 세션과 토큰을 폐기한다")
    void resetUpdatesActiveUserAndRevokesCredentials() {
        String rawToken = "valid-reset-token";
        stubConsumableToken(rawToken);
        when(passwordEncoder.encode("new-password-123")).thenReturn("encoded-new");
        when(userRepository.updatePasswordIfActive("user-1", "encoded-new")).thenReturn(true);

        service.reset(rawToken, "new-password-123");

        verify(userRepository).updatePasswordIfActive("user-1", "encoded-new");
        verify(userRepository, never()).save(any());
        verify(userSessionRevocationPort).revokeUserSessions("user-1");
        verify(passwordResetTokenRepository).deleteByUserId("user-1");
    }

    @Test
    @DisplayName("시나리오: 세션 폐기 실패가 비밀번호 재설정과 토큰 정리를 방해하지 않는다")
    void resetCompletesWhenSessionRevocationFails() {
        String rawToken = "valid-reset-token";
        stubConsumableToken(rawToken);
        when(passwordEncoder.encode("new-password-123")).thenReturn("encoded-new");
        when(userRepository.updatePasswordIfActive("user-1", "encoded-new")).thenReturn(true);
        doThrow(new IllegalStateException("revocation failed"))
                .when(userSessionRevocationPort)
                .revokeUserSessions("user-1");

        assertDoesNotThrow(() -> service.reset(rawToken, "new-password-123"));

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
    }

    @Test
    @DisplayName("시나리오: 탈퇴하거나 없는 계정의 재설정 링크는 폐기한다")
    void resetRejectsInactiveOwner() {
        String rawToken = "orphan-reset-token";
        stubConsumableToken(rawToken);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new");
        when(userRepository.updatePasswordIfActive("user-1", "encoded-new")).thenReturn(false);

        assertThatThrownBy(() -> service.reset(rawToken, "new-password"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("유효하지 않은 링크");

        verify(passwordResetTokenRepository).deleteByUserId("user-1");
        verify(userSessionRevocationPort, never()).revokeUserSessions(any());
    }

    @Test
    @DisplayName("시나리오: 만료된 재설정 링크도 한 번 소비한 뒤 거절한다")
    void resetConsumesExpiredToken() {
        String rawToken = "expired-token";
        PasswordResetToken expired = validToken(rawToken);
        expired.setExpiresAt(Instant.now().minusSeconds(60));
        when(passwordResetTokenRepository.consumeByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> service.reset(rawToken, "new-password"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("유효하지 않은 링크");

        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).updatePasswordIfActive(any(), any());
    }

    private void stubConsumableToken(String rawToken) {
        when(passwordResetTokenRepository.consumeByTokenHash(hash(rawToken)))
                .thenReturn(Optional.of(validToken(rawToken)));
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

    private User activeUser() {
        return UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
    }

    private static String hash(String rawToken) {
        return PasswordResetTokenCodec.hash(rawToken);
    }
}
