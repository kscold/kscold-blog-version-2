package com.kscold.blog.identity.application.port.in;

import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.LoginCommand;
import com.kscold.blog.identity.application.dto.PasswordResetTokenStatus;
import com.kscold.blog.identity.application.dto.RegisterCommand;

public interface AuthUseCase {

    AuthResult register(RegisterCommand command);

    AuthResult login(LoginCommand command);

    AuthResult refresh(String refreshToken);

    AuthResult.UserInfo getMe(String userId);

    void sendUsernameReminder(String email);

    void requestPasswordReset(String email);

    PasswordResetTokenStatus validatePasswordResetToken(String token);

    void resetPassword(String token, String newPassword);
}
