package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.LoginCommand;
import com.kscold.blog.identity.application.dto.RegisterCommand;
import com.kscold.blog.identity.application.service.AuthApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthApplicationService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResult>> register(
            @Valid @RequestBody RegisterCommand command
    ) {
        AuthResult result = authService.register(command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(result, "회원가입이 완료되었습니다"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResult>> login(
            @Valid @RequestBody LoginCommand command
    ) {
        AuthResult result = authService.login(command);
        return ResponseEntity.ok(ApiResponse.success(result, "로그인에 성공했습니다"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResult>> refresh(
            @RequestBody Map<String, String> request
    ) {
        String refreshToken = request.get("refreshToken");
        AuthResult result = authService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(result, "토큰이 갱신되었습니다"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResult.UserInfo>> getMe(
            @AuthenticationPrincipal String userId
    ) {
        AuthResult.UserInfo userInfo = authService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }
}
