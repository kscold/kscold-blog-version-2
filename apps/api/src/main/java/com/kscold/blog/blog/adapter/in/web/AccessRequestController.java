package com.kscold.blog.blog.adapter.in.web;

import com.kscold.blog.blog.adapter.in.web.dto.request.ApproveAccessRequest;
import com.kscold.blog.blog.adapter.in.web.dto.request.CreateAccessRequest;
import com.kscold.blog.blog.adapter.in.web.dto.response.AccessRequestResponse;
import com.kscold.blog.blog.application.port.in.AccessRequestUseCase;
import com.kscold.blog.blog.domain.model.AccessRequest;
import com.kscold.blog.shared.web.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AccessRequestController {

    private final AccessRequestUseCase accessRequestUseCase;

    // 유저: 접근 요청
    @PostMapping("/api/access-requests")
    public ResponseEntity<ApiResponse<AccessRequestResponse>> requestAccess(
            @AuthenticationPrincipal String userId, @RequestBody CreateAccessRequest body) {
        AccessRequest request =
                accessRequestUseCase.requestAccess(userId, body.getPostId(), body.getMessage());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AccessRequestResponse.from(request), "접근 요청이 등록되었습니다"));
    }

    // 유저: 내 요청 목록
    @GetMapping("/api/access-requests/me")
    public ResponseEntity<ApiResponse<List<AccessRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        AccessRequestResponse.from(accessRequestUseCase.getMyRequests(userId))));
    }

    // 유저: 특정 카테고리 접근 권한 확인
    @GetMapping("/api/access-requests/check/{categoryId}")
    public ResponseEntity<ApiResponse<Boolean>> checkAccess(
            @AuthenticationPrincipal String userId,
            @PathVariable String categoryId,
            @RequestParam(required = false) String postId) {
        boolean hasAccess =
                postId != null
                        ? accessRequestUseCase.hasAccess(userId, postId, categoryId)
                        : accessRequestUseCase.hasAccess(userId, categoryId);
        return ResponseEntity.ok(ApiResponse.success(hasAccess));
    }

    // 어드민: 대기 중인 요청 목록
    @GetMapping("/api/admin/access-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AccessRequestResponse>>> getPendingRequests() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        AccessRequestResponse.from(accessRequestUseCase.getPendingRequests())));
    }

    // 어드민: 승인
    @PutMapping("/api/admin/access-requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccessRequestResponse>> approve(
            @PathVariable String id, @RequestBody(required = false) ApproveAccessRequest body) {
        AccessRequest.GrantScope grantScope = body != null ? body.getGrantScope() : null;
        return ResponseEntity.ok(
                ApiResponse.success(
                        AccessRequestResponse.from(accessRequestUseCase.approve(id, grantScope)),
                        "승인되었습니다"));
    }

    // 어드민: 거절
    @PutMapping("/api/admin/access-requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AccessRequestResponse>> reject(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        AccessRequestResponse.from(accessRequestUseCase.reject(id)), "거절되었습니다"));
    }
}
