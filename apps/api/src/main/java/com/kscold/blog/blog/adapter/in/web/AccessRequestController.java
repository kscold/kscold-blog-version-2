package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class AccessRequestController {

    private final AccessRequestUseCase accessRequestUseCase;

    // 유저: 접근 요청
    @PostMapping("/api/access-requests")
    public ResponseEntity<ApiResponse<AccessRequest>> requestAccess(
            @AuthenticationPrincipal String userId,
            @RequestBody AccessRequestBody body
    ) {
        AccessRequest request = accessRequestUseCase.requestAccess(userId, body.postId(), body.message());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(request, "접근 요청이 등록되었습니다"));
    }

    // 유저: 내 요청 목록
    @GetMapping("/api/access-requests/me")
    public ResponseEntity<ApiResponse<List<AccessRequest>>> getMyRequests(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(accessRequestUseCase.getMyRequests(userId)));
    }

    // 유저: 특정 카테고리 접근 권한 확인
    @GetMapping("/api/access-requests/check/{categoryId}")
    public ResponseEntity<ApiResponse<Boolean>> checkAccess(
            @AuthenticationPrincipal String userId,
            @PathVariable String categoryId,
            @RequestParam(required = false) String postId
    ) {
        boolean hasAccess = postId != null
                ? accessRequestUseCase.hasAccess(userId, postId, categoryId)
                : accessRequestUseCase.hasAccess(userId, categoryId);
        return ResponseEntity.ok(ApiResponse.success(hasAccess));
    }

    // 어드민: 대기 중인 요청 목록
    @GetMapping("/api/admin/access-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccessRequest>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.success(accessRequestUseCase.getPendingRequests()));
    }

    // 어드민: 승인
    @PutMapping("/api/admin/access-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccessRequest>> approve(
            @PathVariable String id,
            @RequestBody(required = false) ApproveAccessRequestBody body
    ) {
        AccessRequest.GrantScope grantScope = body != null ? body.grantScope() : null;
        return ResponseEntity.ok(ApiResponse.success(accessRequestUseCase.approve(id, grantScope), "승인되었습니다"));
    }

    // 어드민: 거절
    @PutMapping("/api/admin/access-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccessRequest>> reject(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(accessRequestUseCase.reject(id), "거절되었습니다"));
    }

    record AccessRequestBody(String postId, String message) {}

    record ApproveAccessRequestBody(AccessRequest.GrantScope grantScope) {}
}
