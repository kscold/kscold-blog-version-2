package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.command.LoginCommand;
import com.kscold.blog.identity.application.dto.command.RecoverUsernameCommand;
import com.kscold.blog.identity.application.dto.command.RefreshTokenCommand;
import com.kscold.blog.identity.application.dto.command.RegisterCommand;
import com.kscold.blog.identity.application.dto.command.RequestPasswordResetCommand;
import com.kscold.blog.identity.application.dto.command.ResetPasswordCommand;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.PasswordResetTokenResponse;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;
    private final AuthCookieManager authCookieManager;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterCommand command, HttpServletResponse response) {
        AuthResponse result = authUseCase.register(command);
        authCookieManager.addAuthenticationCookies(response, result);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "회원가입이 완료되었습니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginCommand command, HttpServletResponse response) {
        AuthResponse result = authUseCase.login(command);
        authCookieManager.addAuthenticationCookies(response, result);
        return ResponseEntity.ok(ApiResponse.success(result, "로그인에 성공했습니다"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody(required = false) RefreshTokenCommand command,
            HttpServletRequest request,
            HttpServletResponse response) {
        String requestToken = command == null ? null : command.getRefreshToken();
        String refreshToken = authCookieManager.resolveRefreshToken(request, requestToken);
        AuthResponse result = authUseCase.refresh(refreshToken);
        authCookieManager.addAuthenticationCookies(response, result);
        return ResponseEntity.ok(ApiResponse.success(result, "토큰이 갱신되었습니다"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        authCookieManager.clearAuthenticationCookies(response);
        return ResponseEntity.ok(ApiResponse.successWithMessage("로그아웃되었습니다"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getMe(
            @AuthenticationPrincipal String userId) {
        AuthResponse.UserInfo userInfo = authUseCase.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @PostMapping("/recover-username")
    public ResponseEntity<ApiResponse<Void>> recoverUsername(
            @Valid @RequestBody RecoverUsernameCommand command) {
        authUseCase.sendUsernameReminder(command.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithMessage("가입한 이메일로 아이디 안내를 보냈습니다."));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody RequestPasswordResetCommand command) {
        authUseCase.requestPasswordReset(command.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithMessage("비밀번호 재설정 안내를 이메일로 보냈습니다."));
    }

    @GetMapping("/password-reset/validate")
    public ResponseEntity<ApiResponse<PasswordResetTokenResponse>> validatePasswordResetToken(
            @RequestParam String token) {
        PasswordResetTokenResponse status = authUseCase.validatePasswordResetToken(token);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordCommand command) {
        authUseCase.resetPassword(command.getToken(), command.getNewPassword());
        return ResponseEntity.ok(ApiResponse.successWithMessage("비밀번호를 다시 설정했습니다."));
    }
}
