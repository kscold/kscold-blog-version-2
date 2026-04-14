package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.LoginCommand;
import com.kscold.blog.identity.application.dto.PasswordResetTokenStatus;
import com.kscold.blog.identity.application.dto.RecoverUsernameCommand;
import com.kscold.blog.identity.application.dto.RefreshTokenCommand;
import com.kscold.blog.identity.application.dto.RequestPasswordResetCommand;
import com.kscold.blog.identity.application.dto.RegisterCommand;
import com.kscold.blog.identity.application.dto.ResetPasswordCommand;
import com.kscold.blog.identity.application.port.in.AuthUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthUseCase authUseCase;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResult>> register(
            @Valid @RequestBody RegisterCommand command
    ) {
        AuthResult result = authUseCase.register(command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "회원가입이 완료되었습니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResult>> login(
            @Valid @RequestBody LoginCommand command
    ) {
        AuthResult result = authUseCase.login(command);
        return ResponseEntity.ok(ApiResponse.success(result, "로그인에 성공했습니다"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResult>> refresh(
            @Valid @RequestBody RefreshTokenCommand command
    ) {
        AuthResult result = authUseCase.refresh(command.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(result, "토큰이 갱신되었습니다"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResult.UserInfo>> getMe(
            @AuthenticationPrincipal String userId
    ) {
        AuthResult.UserInfo userInfo = authUseCase.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    @PostMapping("/recover-username")
    public ResponseEntity<ApiResponse<Void>> recoverUsername(
            @Valid @RequestBody RecoverUsernameCommand command
    ) {
        authUseCase.sendUsernameReminder(command.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithMessage("가입한 이메일로 아이디 안내를 보냈습니다."));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<ApiResponse<Void>> requestPasswordReset(
            @Valid @RequestBody RequestPasswordResetCommand command
    ) {
        authUseCase.requestPasswordReset(command.getEmail());
        return ResponseEntity.ok(ApiResponse.successWithMessage("비밀번호 재설정 안내를 이메일로 보냈습니다."));
    }

    @GetMapping("/password-reset/validate")
    public ResponseEntity<ApiResponse<PasswordResetTokenStatus>> validatePasswordResetToken(
            @RequestParam String token
    ) {
        PasswordResetTokenStatus status = authUseCase.validatePasswordResetToken(token);
        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordCommand command
    ) {
        authUseCase.resetPassword(command.getToken(), command.getNewPassword());
        return ResponseEntity.ok(ApiResponse.successWithMessage("비밀번호를 다시 설정했습니다."));
    }
}
