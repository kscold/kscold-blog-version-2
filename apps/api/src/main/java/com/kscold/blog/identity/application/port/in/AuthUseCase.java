package com.kscold.blog.identity.application.port.in;

import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;

public interface AuthUseCase {

    AuthResponse register(RegisterCommand command);

    AuthResponse login(LoginCommand command);

    AuthResponse refresh(String refreshToken);

    AuthResponse.UserInfo getMe(String userId);

    void sendUsernameReminder(String email);

    void requestPasswordReset(String email);

    PasswordResetTokenResponse validatePasswordResetToken(String token);

    void resetPassword(String token, String newPassword);
}
