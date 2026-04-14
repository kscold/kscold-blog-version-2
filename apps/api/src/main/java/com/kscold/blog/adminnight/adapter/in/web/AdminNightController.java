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
import java.time.LocalDateTime;
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
                        toSlot(body.preferredSlot())
                )
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(request), "Admin Night 신청을 보냈습니다."));
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
                        toSlot(body.preferredSlot())
                )
        );
        return ResponseEntity.ok(ApiResponse.success(toResponse(request), "보완한 신청을 다시 보냈습니다."));
    }

    @GetMapping("/admin-night/requests/me")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getMyRequests(
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(adminNightUseCase.getMyRequests(userId).stream().map(this::toResponse).toList())
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
                                .map(this::toCalendarEntry)
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
                        adminNightUseCase.getRequests(status).stream().map(this::toResponse).toList()
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
                new AdminNightDecisionCommand(toSlot(body.scheduledSlot()))
        );
        return ResponseEntity.ok(ApiResponse.success(toResponse(request), "Admin Night 신청을 승인했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> reject(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) ReviewRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.reject(id, userId, body != null ? body.reviewNote() : null);
        return ResponseEntity.ok(ApiResponse.success(toResponse(request), "Admin Night 신청을 거절했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/request-info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> requestMoreInfo(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody ReviewRequestBody body
    ) {
        AdminNightRequest request = adminNightUseCase.requestMoreInfo(id, userId, body.reviewNote());
        return ResponseEntity.ok(ApiResponse.success(toResponse(request), "추가 정보 요청을 보냈습니다."));
    }

    private AdminNightRequest.SlotInfo toSlot(SlotBody slot) {
        if (slot == null) {
            return null;
        }

        return AdminNightRequest.SlotInfo.builder()
                .slotKey(slot.slotKey())
                .date(slot.date())
                .weekday(slot.weekday())
                .timeLabel(slot.timeLabel())
                .focus(slot.focus())
                .badgeLabel(slot.badgeLabel())
                .build();
    }

    private RequestResponse toResponse(AdminNightRequest request) {
        return new RequestResponse(
                request.getId(),
                request.getUserId(),
                request.getRequesterName(),
                request.getRequesterEmail(),
                request.getTaskTitle(),
                request.getMessage(),
                request.getParticipationMode(),
                request.getStatus(),
                toSlotResponse(request.getPreferredSlot()),
                toSlotResponse(request.getScheduledSlot()),
                request.getReviewNote(),
                request.getDecidedByName(),
                request.getDecidedAt(),
                request.getCreatedAt()
        );
    }

    private CalendarEntryResponse toCalendarEntry(AdminNightRequest request) {
        return new CalendarEntryResponse(
                request.getId(),
                maskName(request.getRequesterName()),
                request.getTaskTitle(),
                request.getParticipationMode(),
                toSlotResponse(request.getScheduledSlot()),
                request.getCreatedAt()
        );
    }

    private SlotResponse toSlotResponse(AdminNightRequest.SlotInfo slot) {
        if (slot == null) {
            return null;
        }

        return new SlotResponse(
                slot.getSlotKey(),
                slot.getDate(),
                slot.getWeekday(),
                slot.getTimeLabel(),
                slot.getFocus(),
                slot.getBadgeLabel()
        );
    }

    private String maskName(String name) {
        if (name == null || name.isBlank()) {
            return "익명";
        }
        if (name.length() == 1) {
            return name + "*";
        }
        if (name.length() == 2) {
            return name.charAt(0) + "*";
        }
        return name.charAt(0) + "*" + name.charAt(name.length() - 1);
    }

    record CreateRequestBody(
            String requesterName,
            String taskTitle,
            String message,
            AdminNightRequest.ParticipationMode participationMode,
            SlotBody preferredSlot
    ) {}

    record ApproveRequestBody(SlotBody scheduledSlot) {}

    record ReviewRequestBody(String reviewNote) {}

    record SlotBody(
            String slotKey,
            LocalDate date,
            String weekday,
            String timeLabel,
            String focus,
            String badgeLabel
    ) {}

    public record SlotResponse(
            String slotKey,
            LocalDate date,
            String weekday,
            String timeLabel,
            String focus,
            String badgeLabel
    ) {}

    public record RequestResponse(
            String id,
            String userId,
            String requesterName,
            String requesterEmail,
            String taskTitle,
            String message,
            AdminNightRequest.ParticipationMode participationMode,
            AdminNightRequest.Status status,
            SlotResponse preferredSlot,
            SlotResponse scheduledSlot,
            String reviewNote,
            String decidedByName,
            LocalDateTime decidedAt,
            LocalDateTime createdAt
    ) {}

    public record CalendarEntryResponse(
            String id,
            String requesterLabel,
            String taskTitle,
            AdminNightRequest.ParticipationMode participationMode,
            SlotResponse scheduledSlot,
            LocalDateTime createdAt
    ) {}
}
