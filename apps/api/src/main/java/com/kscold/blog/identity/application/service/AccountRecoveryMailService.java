package com.kscold.blog.identity.application.service;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.RecoveryMailComposer;
import com.kscold.blog.notification.domain.port.out.MailSender;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** 복구 유형에 맞는 메일을 구성하고 전송한다. */
@Component
@RequiredArgsConstructor
class AccountRecoveryMailService {

    private final MailSender recoveryMailSender;
    private final RecoveryMailComposer recoveryEmailComposer;
    private final PasswordResetTokenIssuer passwordResetTokenIssuer;

    boolean isAvailable() {
        return recoveryMailSender.isAvailable();
    }

    void send(AccountRecoveryAction action, User user) {
        if (action == AccountRecoveryAction.USERNAME_REMINDER) {
            recoveryMailSender.send(recoveryEmailComposer.buildUsernameReminder(user));
            return;
        }

        String resetUrl = passwordResetTokenIssuer.issue(user);
        recoveryMailSender.send(recoveryEmailComposer.buildPasswordReset(user, resetUrl));
    }
}
