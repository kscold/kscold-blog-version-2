package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.command.UpdateProfileCommand;
import com.kscold.blog.identity.application.dto.response.AdminUserResponse;
import com.kscold.blog.identity.application.dto.response.AuthResponse;
import com.kscold.blog.identity.application.dto.response.UserStatsResponse;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.application.port.in.UserProfileUseCase;
import com.kscold.blog.identity.application.service.UserStatsService;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.shared.web.ApiResponse;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserStatsService userStatsService;
    private final UserManagementUseCase userManagementUseCase;
    private final UserProfileUseCase userProfileUseCase;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.success(userStatsService.getStats()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> listAllUsers() {
        List<AdminUserResponse> users =
                userRepository.findAllOrderByCreatedAtDesc().stream()
                        .map(AdminUserResponse::from)
                        .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> updateUserProfile(
            @PathVariable String userId, @RequestBody UpdateProfileCommand command) {
        AuthResponse.UserInfo updated = userProfileUseCase.updateUserProfile(userId, command);
        return ResponseEntity.ok(ApiResponse.success(updated, "프로필이 업데이트되었습니다"));
    }

    /** 소프트 딜리트: 계정 비활성화 (데이터 보존, 복구 가능) */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> softDelete(@PathVariable String userId) {
        userManagementUseCase.softDelete(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "계정이 비활성화되었습니다"));
    }

    /** 하드 딜리트: DB에서 영구 삭제 (복구 불가) */
    @DeleteMapping("/{userId}/permanent")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable String userId) {
        userManagementUseCase.hardDelete(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "계정이 영구 삭제되었습니다"));
    }
}
