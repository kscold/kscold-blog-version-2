package com.kscold.blog.identity.domain.port.out;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.notification.domain.model.MailMessage;

/** 계정 가입과 복구 흐름에서 사용하는 메일을 조립한다. */
public interface RecoveryMailComposer {

    MailMessage buildUsernameReminder(User user);

    MailMessage buildPasswordReset(User user, String resetUrl);

    MailMessage buildWelcome(User user);
}
