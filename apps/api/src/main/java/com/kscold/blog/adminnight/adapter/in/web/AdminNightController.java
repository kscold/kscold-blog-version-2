package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.application.dto.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.port.in.AdminNightUseCase;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.shared.web.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AdminNightController {

    private final AdminNightUseCase adminNightUseCase;

    @PostMapping("/admin-night/requests")
    public ResponseEntity<ApiResponse<RequestResponse>> createRequest(
            @AuthenticationPrincipal String userId,
            @RequestBody CreateRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.createRequest(
                userId,
                new AdminNightCreateCommand(
                        body.requesterName(),
                        body.taskTitle(),
                        body.message(),
                        body.participationMode(),
                        AdminNightWebMapper.toSlot(body.preferredSlot())
                )
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(AdminNightWebMapper.toResponse(request), "Admin Night 신청을 보냈습니다."));
    }

    @PutMapping("/admin-night/requests/{id}/resubmit")
    public ResponseEntity<ApiResponse<RequestResponse>> resubmitRequest(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody CreateRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.resubmit(
                id,
                userId,
                new AdminNightCreateCommand(
                        body.requesterName(),
                        body.taskTitle(),
                        body.message(),
                        body.participationMode(),
                        AdminNightWebMapper.toSlot(body.preferredSlot())
                )
        );
        return ResponseEntity.ok(ApiResponse.success(AdminNightWebMapper.toResponse(request), "보완한 신청을 다시 보냈습니다."));
    }

    @GetMapping("/admin-night/requests/me")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getMyRequests(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(adminNightUseCase.getMyRequests(userId).stream().map(AdminNightWebMapper::toResponse).toList())
        );
    }

    @GetMapping("/admin-night/calendar")
    public ResponseEntity<ApiResponse<List<CalendarEntryResponse>>> getCalendarEntries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getApprovedRequests(from, to).stream()
                                .map(AdminNightWebMapper::toCalendarEntry)
                                .toList()
                )
        );
    }

    @GetMapping("/admin/admin-night/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getAdminRequests(
            @RequestParam(required = false) AdminNightRequest.Status status
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getRequests(status).stream().map(AdminNightWebMapper::toResponse).toList()
                )
        );
    }

    @PutMapping("/admin/admin-night/requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> approve(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody ApproveRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.approve(
                id,
                userId,
                new AdminNightDecisionCommand(AdminNightWebMapper.toSlot(body.scheduledSlot()))
        );
        return ResponseEntity.ok(ApiResponse.success(AdminNightWebMapper.toResponse(request), "Admin Night 신청을 승인했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> reject(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) ReviewRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.reject(id, userId, body != null ? body.reviewNote() : null);
        return ResponseEntity.ok(ApiResponse.success(AdminNightWebMapper.toResponse(request), "Admin Night 신청을 거절했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/request-info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> requestMoreInfo(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody ReviewRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.requestMoreInfo(id, userId, body.reviewNote());
        return ResponseEntity.ok(ApiResponse.success(AdminNightWebMapper.toResponse(request), "추가 정보 요청을 보냈습니다."));
    }
}
