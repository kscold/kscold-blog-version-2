package com.kscold.blog.identity.adapter.in.web;

import com.kscold.blog.identity.application.dto.UserStatsDto;
import com.kscold.blog.identity.application.port.in.UserManagementUseCase;
import com.kscold.blog.identity.application.service.UserStatsService;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserStatsService userStatsService;
    private final UserManagementUseCase userManagementUseCase;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<UserStatsDto>> getUserStats() {
        return ResponseEntity.ok(ApiResponse.success(userStatsService.getStats()));
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
