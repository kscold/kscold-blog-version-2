package com.kscold.blog.adminnight.adapter.in.web;

import com.kscold.blog.adminnight.adapter.in.web.dto.request.ApproveRequest;
import com.kscold.blog.adminnight.adapter.in.web.dto.request.CreateRequest;
import com.kscold.blog.adminnight.adapter.in.web.dto.request.ProgramVoteRequest;
import com.kscold.blog.adminnight.adapter.in.web.dto.request.ReviewRequest;
import com.kscold.blog.adminnight.adapter.in.web.dto.response.CalendarEntryResponse;
import com.kscold.blog.adminnight.adapter.in.web.dto.response.ProgramVoteResponse;
import com.kscold.blog.adminnight.adapter.in.web.dto.response.ProgramVoteSummaryResponse;
import com.kscold.blog.adminnight.adapter.in.web.dto.response.RequestResponse;
import com.kscold.blog.adminnight.application.dto.command.AdminNightCreateCommand;
import com.kscold.blog.adminnight.application.dto.command.AdminNightDecisionCommand;
import com.kscold.blog.adminnight.application.dto.command.AdminNightProgramVoteCommand;
import com.kscold.blog.adminnight.application.port.in.AdminNightUseCase;
import com.kscold.blog.adminnight.domain.model.AdminNightProgramVote;
import com.kscold.blog.adminnight.domain.model.AdminNightRequest;
import com.kscold.blog.shared.web.ApiResponse;
import java.time.LocalDate;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AdminNightController {

    private final AdminNightUseCase adminNightUseCase;

    @PostMapping("/admin-night/requests")
    public ResponseEntity<ApiResponse<RequestResponse>> createRequest(
            @AuthenticationPrincipal String userId, @RequestBody CreateRequest body) {
        AdminNightRequest request =
                adminNightUseCase.createRequest(
                        userId,
                        new AdminNightCreateCommand(
                                body.getRequesterName(),
                                body.getTaskTitle(),
                                body.getMessage(),
                                body.getParticipationMode(),
                                AdminNightWebMapper.toSlot(body.getPreferredSlot())));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(RequestResponse.from(request), "Admin Night 신청을 보냈습니다."));
    }

    @PutMapping("/admin-night/requests/{id}/resubmit")
    public ResponseEntity<ApiResponse<RequestResponse>> resubmitRequest(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody CreateRequest body) {
        AdminNightRequest request =
                adminNightUseCase.resubmit(
                        id,
                        userId,
                        new AdminNightCreateCommand(
                                body.getRequesterName(),
                                body.getTaskTitle(),
                                body.getMessage(),
                                body.getParticipationMode(),
                                AdminNightWebMapper.toSlot(body.getPreferredSlot())));
        return ResponseEntity.ok(
                ApiResponse.success(RequestResponse.from(request), "보완한 신청을 다시 보냈습니다."));
    }

    @GetMapping("/admin-night/requests/me")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getMyRequests(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getMyRequests(userId).stream()
                                .map(RequestResponse::from)
                                .toList()));
    }

    @GetMapping("/admin-night/calendar")
    public ResponseEntity<ApiResponse<List<CalendarEntryResponse>>> getCalendarEntries(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getApprovedRequests(from, to).stream()
                                .map(CalendarEntryResponse::from)
                                .toList()));
    }

    @PostMapping("/admin-night/programs/{programKey}/votes")
    public ResponseEntity<ApiResponse<ProgramVoteResponse>> upsertProgramVote(
            @PathVariable String programKey,
            @AuthenticationPrincipal String userId,
            @RequestBody ProgramVoteRequest body) {
        AdminNightProgramVote vote =
                adminNightUseCase.upsertProgramVote(
                        programKey,
                        userId,
                        new AdminNightProgramVoteCommand(
                                body.getRequesterName(),
                                body.getContactEmail(),
                                body.getContact(),
                                body.getInterestLevel(),
                                body.getPreferredFormat(),
                                body.getExperienceLevel(),
                                body.getSessionStyle(),
                                body.getSessionLength(),
                                body.getFoodPreference(),
                                body.getPreferredDays(),
                                body.getPreferredTimes(),
                                body.getInterestedTopics(),
                                body.getDesiredTakeaways(),
                                body.getMessage()));
        return ResponseEntity.ok(
                ApiResponse.success(
                        ProgramVoteResponse.from(vote), "AI Agent Bloom 관심 투표를 저장했습니다."));
    }

    @GetMapping("/admin-night/programs/{programKey}/votes/me")
    public ResponseEntity<ApiResponse<ProgramVoteResponse>> getMyProgramVote(
            @PathVariable String programKey, @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase
                                .getMyProgramVote(programKey, userId)
                                .map(ProgramVoteResponse::from)
                                .orElse(null)));
    }

    @GetMapping("/admin-night/programs/{programKey}/summary")
    public ResponseEntity<ApiResponse<ProgramVoteSummaryResponse>> getProgramVoteSummary(
            @PathVariable String programKey) {
        List<AdminNightProgramVote> votes = adminNightUseCase.getProgramVotes(programKey);
        return ResponseEntity.ok(
                ApiResponse.success(ProgramVoteSummaryResponse.from(programKey, votes)));
    }

    @GetMapping("/admin/admin-night/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RequestResponse>>> getAdminRequests(
            @RequestParam(required = false) AdminNightRequest.Status status) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getRequests(status).stream()
                                .map(RequestResponse::from)
                                .toList()));
    }

    @PutMapping("/admin/admin-night/requests/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> approve(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody ApproveRequest body) {
        AdminNightRequest request =
                adminNightUseCase.approve(
                        id,
                        userId,
                        new AdminNightDecisionCommand(
                                AdminNightWebMapper.toSlot(body.getScheduledSlot())));
        return ResponseEntity.ok(
                ApiResponse.success(RequestResponse.from(request), "Admin Night 신청을 승인했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> reject(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) ReviewRequest body) {
        AdminNightRequest request =
                adminNightUseCase.reject(id, userId, body != null ? body.getReviewNote() : null);
        return ResponseEntity.ok(
                ApiResponse.success(RequestResponse.from(request), "Admin Night 신청을 거절했습니다."));
    }

    @PutMapping("/admin/admin-night/requests/{id}/request-info")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RequestResponse>> requestMoreInfo(
            @PathVariable String id,
            @AuthenticationPrincipal String userId,
            @RequestBody ReviewRequest body) {
        AdminNightRequest request =
                adminNightUseCase.requestMoreInfo(id, userId, body.getReviewNote());
        return ResponseEntity.ok(
                ApiResponse.success(RequestResponse.from(request), "추가 정보 요청을 보냈습니다."));
    }

    @GetMapping("/admin/admin-night/programs/{programKey}/votes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProgramVoteResponse>>> getAdminProgramVotes(
            @PathVariable String programKey) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminNightUseCase.getProgramVotes(programKey).stream()
                                .map(ProgramVoteResponse::from)
                                .toList()));
    }
}
