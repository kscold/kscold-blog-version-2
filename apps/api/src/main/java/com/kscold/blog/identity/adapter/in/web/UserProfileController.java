package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.AuthResult;
import com.kscold.blog.identity.application.dto.UpdateProfileCommand;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileUseCase userProfileUseCase;

    @PatchMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AuthResult.UserInfo>> updateMyProfile(
            @AuthenticationPrincipal String userId,
            @RequestBody UpdateProfileCommand command
    ) {
        AuthResult.UserInfo updated = userProfileUseCase.updateMyProfile(userId, command);
        return ResponseEntity.ok(ApiResponse.success(updated, "프로필이 업데이트되었습니다"));
    }

    @GetMapping("/tech-stacks")
    public ResponseEntity<ApiResponse<List<String>>> getTechStacks() {
        return ResponseEntity.ok(ApiResponse.success(userProfileUseCase.getAllTechStacks()));
    }
}
