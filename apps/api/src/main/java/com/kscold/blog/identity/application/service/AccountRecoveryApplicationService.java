package com.kscold.blog.identity.application.service;

import com.kscold.blog.exception.BusinessException;
import com.kscold.blog.exception.ErrorCode;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import java.util.concurrent.Executor;
import java.util.concurrent.RejectedExecutionException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;

/** 계정 복구 요청의 비동기 접수와 비밀번호 재설정 계약을 담당한다. */
@Slf4j
@Service
public class AccountRecoveryApplicationService {

    private final AccountRecoveryWorker recoveryWorker;
    private final PasswordResetService passwordResetService;
    private final Executor accountRecoveryExecutor;

    public AccountRecoveryApplicationService(
            AccountRecoveryWorker recoveryWorker,
            PasswordResetService passwordResetService,
            @Qualifier("accountRecoveryExecutor") Executor accountRecoveryExecutor) {
        this.recoveryWorker = recoveryWorker;
        this.passwordResetService = passwordResetService;
        this.accountRecoveryExecutor = accountRecoveryExecutor;
    }

    public void sendUsernameReminder(String email) {
        enqueue(AccountRecoveryAction.USERNAME_REMINDER, email);
    }

    public void requestPasswordReset(String email) {
        enqueue(AccountRecoveryAction.PASSWORD_RESET, email);
    }

    public PasswordResetTokenResponse validatePasswordResetToken(String token) {
        return passwordResetService.validate(token);
    }

    public void resetPassword(String token, String newPassword) {
        passwordResetService.reset(token, newPassword);
    }

    private void enqueue(AccountRecoveryAction action, String email) {
        ensureRecoveryMailConfigured();
        String normalizedEmail = email.trim();
        try {
            accountRecoveryExecutor.execute(() -> recoveryWorker.process(action, normalizedEmail));
        } catch (TaskRejectedException exception) {
            throw queueUnavailable(action, exception);
        } catch (RejectedExecutionException exception) {
            throw queueUnavailable(action, exception);
        }
    }

    private void ensureRecoveryMailConfigured() {
        if (!recoveryWorker.isMailAvailable()) {
            throw new BusinessException(
                    ErrorCode.INTERNAL_SERVER_ERROR, "이메일 발송 설정이 아직 준비되지 않았습니다. SMTP 설정을 확인해주세요.");
        }
    }

    private BusinessException queueUnavailable(
            AccountRecoveryAction action, RuntimeException exception) {
        log.warn(
                "계정 복구 작업 큐가 가득 찼습니다: action={}, type={}",
                action,
                exception.getClass().getSimpleName());
        return new BusinessException(
                ErrorCode.RATE_LIMIT_EXCEEDED, "계정 복구 요청이 많습니다. 잠시 후 다시 시도해주세요.");
    }
}
