package com.kscold.blog.identity.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.domain.model.PasswordResetToken;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.PasswordResetSettings;
import com.kscold.blog.identity.domain.port.out.PasswordResetTokenRepository;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.notification.domain.model.MailMessage;
import com.kscold.blog.notification.domain.port.out.MailSender;
import com.kscold.blog.notification.domain.port.out.PublicUrlResolver;
import com.kscold.blog.support.UserFixtures;
import java.util.ArrayDeque;
import java.util.Optional;
import java.util.Queue;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.task.TaskRejectedException;

@ExtendWith(MockitoExtension.class)
class AccountRecoveryApplicationServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private MailSender recoveryMailSender;
    @Mock private RecoveryMailComposer recoveryEmailComposer;
    @Mock private PublicUrlResolver recoveryMailProperties;
    @Mock private PasswordResetSettings passwordResetSettings;
    @Mock private PasswordResetService passwordResetService;

    private AccountRecoveryWorker recoveryWorker;
    private CapturingExecutor capturingExecutor;
    private AccountRecoveryApplicationService service;

    @BeforeEach
    void setUp() {
        PasswordResetTokenIssuer tokenIssuer =
                new PasswordResetTokenIssuer(
                        passwordResetTokenRepository,
                        recoveryMailProperties,
                        passwordResetSettings);
        AccountRecoveryMailService mailService =
                new AccountRecoveryMailService(
                        recoveryMailSender, recoveryEmailComposer, tokenIssuer);
        recoveryWorker = new AccountRecoveryWorker(userRepository, mailService);
        capturingExecutor = new CapturingExecutor();
        service = createService(capturingExecutor);
        lenient().when(recoveryMailSender.isAvailable()).thenReturn(true);
    }

    @Test
    @DisplayName("시나리오: 아이디 찾기는 작업 실행 전 계정 저장소를 조회하지 않는다")
    void usernameReminderLooksUpAccountOnlyInsideWorker() {
        User user = activeUser();
        MailMessage mail = mailFor(user, "가입 아이디 안내");
        when(userRepository.findActiveByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(recoveryEmailComposer.buildUsernameReminder(user)).thenReturn(mail);

        service.sendUsernameReminder(" " + user.getEmail() + " ");

        verify(userRepository, never()).findActiveByEmail(any());
        assertThat(capturingExecutor.size()).isOne();
        capturingExecutor.runNext();
        verify(userRepository).findActiveByEmail(user.getEmail());
        verify(recoveryMailSender).send(mail);
    }

    @Test
    @DisplayName("시나리오: 비밀번호 재설정은 작업 실행 전 조회나 토큰 저장을 하지 않는다")
    void passwordResetLooksUpAccountAndStoresTokenOnlyInsideWorker() {
        User user = activeUser();
        MailMessage mail = stubPasswordResetMail(user);

        service.requestPasswordReset(user.getEmail());

        verify(userRepository, never()).findActiveByEmail(any());
        verify(passwordResetTokenRepository, never()).save(any());
        capturingExecutor.runNext();
        verify(passwordResetTokenRepository).deleteByUserId(user.getId());
        verify(passwordResetTokenRepository).save(any());
        verify(recoveryMailSender).send(mail);
    }

    @Test
    @DisplayName("시나리오: 활성·미가입·탈퇴 이메일과 두 복구 유형은 모두 같은 큐 경로를 사용한다")
    void everyAccountStateAndRecoveryActionUsesTheSameQueuePath() {
        User activeUser = UserFixtures.user("active-1", User.Role.USER, "active", "활성 사용자");
        stubPasswordResetMail(activeUser);
        when(recoveryEmailComposer.buildUsernameReminder(activeUser))
                .thenReturn(mailFor(activeUser, "가입 아이디 안내"));
        when(userRepository.findActiveByEmail("missing@example.com")).thenReturn(Optional.empty());
        when(userRepository.findActiveByEmail("deleted@example.com")).thenReturn(Optional.empty());
        String[] emails = {activeUser.getEmail(), "missing@example.com", "deleted@example.com"};

        for (String email : emails) {
            service.sendUsernameReminder(email);
            service.requestPasswordReset(email);
        }

        assertThat(capturingExecutor.size()).isEqualTo(6);
        verify(userRepository, never()).findActiveByEmail(any());
        capturingExecutor.runAll();
        for (String email : emails) {
            verify(userRepository, times(2)).findActiveByEmail(email);
        }
        verify(passwordResetTokenRepository, times(1)).save(any());
        verify(recoveryMailSender, times(2)).send(any());
    }

    @Test
    @DisplayName("시나리오: SMTP 실패는 접수 결과에 영향을 주지 않고 저장된 재설정 토큰을 유지한다")
    void smtpFailureDoesNotAffectEnqueueResultOrDeleteSavedToken() {
        User user = activeUser();
        MailMessage mail = stubPasswordResetMail(user);
        doThrow(new IllegalStateException("smtp failed")).when(recoveryMailSender).send(mail);
        service = createService(Runnable::run);

        assertDoesNotThrow(() -> service.requestPasswordReset(user.getEmail()));

        ArgumentCaptor<PasswordResetToken> tokenCaptor =
                ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        verify(passwordResetTokenRepository, times(1)).deleteByUserId(user.getId());
        assertThat(tokenCaptor.getValue().getTokenHash()).isNotBlank();
    }

    @Test
    @DisplayName("시나리오: 포화된 큐는 두 요청 모두 조회 없이 같은 429 오류를 반환한다")
    void rejectingExecutorNeverRunsOnCallerAndReturnsTheSameError() {
        Executor springRejectingExecutor =
                task -> {
                    throw new TaskRejectedException("queue full");
                };
        service = createService(springRejectingExecutor);
        assertQueueRejected(() -> service.sendUsernameReminder("user@example.com"));

        Executor jdkRejectingExecutor =
                task -> {
                    throw new RejectedExecutionException("queue full");
                };
        service = createService(jdkRejectingExecutor);
        assertQueueRejected(() -> service.requestPasswordReset("user@example.com"));

        verify(userRepository, never()).findActiveByEmail(any());
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("시나리오: 토큰 검증과 비밀번호 갱신은 재설정 서비스에 위임한다")
    void delegatesPasswordResetOperations() {
        PasswordResetTokenResponse response =
                new PasswordResetTokenResponse(true, "유효한 재설정 링크입니다.", null);
        when(passwordResetService.validate("reset-token")).thenReturn(response);

        assertThat(service.validatePasswordResetToken("reset-token")).isSameAs(response);
        service.resetPassword("reset-token", "new-password");

        verify(passwordResetService).reset("reset-token", "new-password");
    }

    @Test
    @DisplayName("시나리오: 메일 설정이 없으면 큐와 계정 저장소에 접근하지 않는다")
    void unavailableMailConfigurationRejectsBeforeEnqueue() {
        when(recoveryMailSender.isAvailable()).thenReturn(false);

        assertThatThrownBy(() -> service.sendUsernameReminder("user@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SMTP 설정");

        assertThat(capturingExecutor.size()).isZero();
        verify(userRepository, never()).findActiveByEmail(any());
    }

    private MailMessage stubPasswordResetMail(User user) {
        MailMessage mail = mailFor(user, "비밀번호 재설정 안내");
        when(userRepository.findActiveByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordResetSettings.getPasswordResetExpiryMinutes()).thenReturn(30L);
        when(recoveryMailProperties.resolvePublicUrl(startsWith("/login/reset-password?token=")))
                .thenAnswer(invocation -> "https://kscold.com" + invocation.getArgument(0));
        when(recoveryEmailComposer.buildPasswordReset(
                        eq(user), startsWith("https://kscold.com/login/reset-password?token=")))
                .thenReturn(mail);
        return mail;
    }

    private void assertQueueRejected(Runnable request) {
        assertThatThrownBy(request::run)
                .isInstanceOfSatisfying(
                        BusinessException.class,
                        exception ->
                                assertThat(exception.getErrorCode())
                                        .isEqualTo(ErrorCode.RATE_LIMIT_EXCEEDED));
    }

    private AccountRecoveryApplicationService createService(Executor executor) {
        return new AccountRecoveryApplicationService(
                recoveryWorker, passwordResetService, executor);
    }

    private User activeUser() {
        return UserFixtures.user("user-1", User.Role.USER, "kscold", "김승찬");
    }

    private MailMessage mailFor(User user, String subject) {
        return new MailMessage(user.getEmail(), subject, "plain", "<html></html>");
    }

    private static final class CapturingExecutor implements Executor {

        private final Queue<Runnable> tasks = new ArrayDeque<>();

        @Override
        public void execute(Runnable task) {
            tasks.add(task);
        }

        int size() {
            return tasks.size();
        }

        void runNext() {
            tasks.remove().run();
        }

        void runAll() {
            while (!tasks.isEmpty()) {
                runNext();
            }
        }
    }
}
