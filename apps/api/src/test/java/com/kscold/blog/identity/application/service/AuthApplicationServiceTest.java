package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.domain.model.TokenIdentity;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.TokenProvider;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.support.UserFixtures;
import java.time.LocalDateTime;
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

    @Mock private PasswordEncoder passwordEncoder;

    @Mock private TokenProvider tokenProvider;

    @Mock private MailSender recoveryMailSender;

    @Mock private RecoveryMailComposer recoveryEmailComposer;

    @Mock private NotificationUseCase notificationUseCase;

    @Mock private AccountRecoveryApplicationService accountRecoveryApplicationService;

    @InjectMocks private AuthApplicationService authApplicationService;

    @Test
    @DisplayName("시나리오: 탈퇴 계정 로그인은 미가입 계정과 같은 오류를 반환한다")
    void loginDoesNotRevealDeletedAccount() {
        LoginCommand command = new LoginCommand("deleted@example.com", "wrong-password");
        when(userRepository.findActiveByEmail(command.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authApplicationService.login(command))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("이메일 또는 비밀번호가 올바르지 않습니다");

        verify(passwordEncoder, never()).matches(any(), any());
        verify(tokenProvider, never()).createAccessToken(any(), any(), anyLong());
    }

    @Test
    @DisplayName("시나리오: 비활성 계정은 리프레시 토큰으로 세션을 연장할 수 없다")
    void refreshRejectsDeletedUser() {
        User user = UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
        user.setDeletedAt(LocalDateTime.now());
        when(tokenProvider.parseRefreshToken("refresh-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 0L)));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authApplicationService.refresh("refresh-token"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("비활성화된 계정");
        verify(tokenProvider, never()).createAccessToken(any(), any(), anyLong());
        verify(tokenProvider, never()).createRefreshToken(any(), any(), anyLong());
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
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId("user-1");
                            return user;
                        });
        when(tokenProvider.createAccessToken("user-1", "USER", 0L)).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER", 0L)).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(true);
        when(recoveryEmailComposer.buildWelcome(any(User.class))).thenReturn(welcomeMail);

        AuthResponse result = authApplicationService.register(command);

        assertThat(result.getUser().getEmail()).isEqualTo(command.getEmail());
        verify(recoveryMailSender).send(welcomeMail);
    }

    @Test
    @DisplayName("시나리오: 첫 회원가입도 관리자 권한을 자동으로 얻지 않는다")
    void registerAlwaysAssignsUserRoleWithoutBootstrapLookup() {
        RegisterCommand command =
                new RegisterCommand("first@example.com", "first", "password-123", "첫 사용자");

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId("user-1");
                            return user;
                        });
        when(tokenProvider.createAccessToken("user-1", "USER", 0L)).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER", 0L)).thenReturn("refresh-token");

        AuthResponse result = authApplicationService.register(command);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        verify(userRepository, never()).count();
        assertThat(userCaptor.getValue().getRole()).isEqualTo(User.Role.USER);
        assertThat(userCaptor.getValue().getCredentialVersion()).isZero();
        assertThat(result.getUser().getRole()).isEqualTo(User.Role.USER);
    }

    @Test
    @DisplayName("시나리오: SMTP가 없어도 회원가입 자체는 완료된다")
    void registerCompletesWithoutMailSender() {
        RegisterCommand command =
                new RegisterCommand("hello@example.com", "hello", "password-123", "헬로");

        when(userRepository.existsByEmail(command.getEmail())).thenReturn(false);
        when(userRepository.existsByUsername(command.getUsername())).thenReturn(false);
        when(passwordEncoder.encode(command.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
                            user.setId("user-1");
                            return user;
                        });
        when(tokenProvider.createAccessToken("user-1", "USER", 0L)).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER", 0L)).thenReturn("refresh-token");
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        AuthResponse result = authApplicationService.register(command);

        assertThat(result.getUser().getUsername()).isEqualTo(command.getUsername());
        verify(recoveryMailSender, never()).send(any());
    }

    @Test
    @DisplayName("시나리오: 로그인은 사용자의 현재 자격 버전으로 두 토큰을 발급한다")
    void loginIssuesTokensWithCurrentCredentialVersion() {
        LoginCommand command = new LoginCommand("user@example.com", "password-123");
        User user = UserFixtures.user("user-1", User.Role.USER, "user", "사용자");
        user.setPassword("encoded-password");
        user.setCredentialVersion(5L);
        when(userRepository.findActiveByEmail(command.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(command.getPassword(), user.getPassword())).thenReturn(true);
        when(tokenProvider.createAccessToken("user-1", "USER", 5L)).thenReturn("access-token");
        when(tokenProvider.createRefreshToken("user-1", "USER", 5L)).thenReturn("refresh-token");

        authApplicationService.login(command);

        verify(tokenProvider).createAccessToken("user-1", "USER", 5L);
        verify(tokenProvider).createRefreshToken("user-1", "USER", 5L);
    }

    @Test
    @DisplayName("시나리오: 이전 자격 버전의 리프레시 토큰은 세션을 연장하지 못한다")
    void refreshRejectsPreviousCredentialVersion() {
        User user = UserFixtures.user("user-1", User.Role.USER, "user", "사용자");
        user.setCredentialVersion(2L);
        when(tokenProvider.parseRefreshToken("refresh-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 1L)));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authApplicationService.refresh("refresh-token"))
                .isInstanceOf(InvalidRequestException.class)
                .hasMessageContaining("유효하지 않은 리프레시 토큰");

        verify(tokenProvider, never()).createAccessToken(any(), any(), anyLong());
        verify(tokenProvider, never()).createRefreshToken(any(), any(), anyLong());
    }

    @Test
    @DisplayName("시나리오: 리프레시는 데이터베이스의 현재 역할과 자격 버전을 사용한다")
    void refreshIssuesTokensWithCurrentRoleAndCredentialVersion() {
        User user = UserFixtures.user("user-1", User.Role.ADMIN, "admin", "관리자");
        user.setCredentialVersion(3L);
        when(tokenProvider.parseRefreshToken("refresh-token"))
                .thenReturn(Optional.of(new TokenIdentity("user-1", 3L)));
        when(userRepository.findById("user-1")).thenReturn(Optional.of(user));
        when(tokenProvider.createAccessToken("user-1", "ADMIN", 3L)).thenReturn("new-access-token");
        when(tokenProvider.createRefreshToken("user-1", "ADMIN", 3L))
                .thenReturn("new-refresh-token");

        authApplicationService.refresh("refresh-token");

        verify(tokenProvider).createAccessToken("user-1", "ADMIN", 3L);
        verify(tokenProvider).createRefreshToken("user-1", "ADMIN", 3L);
    }

    @Test
    @DisplayName("시나리오: 계정 복구 계약은 전용 서비스에 위임한다")
    void delegatesAccountRecoveryContract() {
        authApplicationService.sendUsernameReminder("user@example.com");
        authApplicationService.requestPasswordReset("user@example.com");
        authApplicationService.validatePasswordResetToken("reset-token");
        authApplicationService.resetPassword("reset-token", "new-password");

        verify(accountRecoveryApplicationService).sendUsernameReminder("user@example.com");
        verify(accountRecoveryApplicationService).requestPasswordReset("user@example.com");
        verify(accountRecoveryApplicationService).validatePasswordResetToken("reset-token");
        verify(accountRecoveryApplicationService).resetPassword("reset-token", "new-password");
    }
}
