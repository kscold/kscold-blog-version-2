package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.adapter.in.web.dto.request.FeedCopilotDraftRequest;
import com.kscold.blog.social.adapter.in.web.dto.request.FeedCopilotPlanRequest;
import com.kscold.blog.social.application.dto.response.FeedCopilotDraftResponse;
import com.kscold.blog.social.application.dto.response.FeedCopilotPlanResponse;
import com.kscold.blog.social.application.port.in.FeedCopilotUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/feeds/copilot")
@RequiredArgsConstructor
public class FeedCopilotController {

    private final FeedCopilotUseCase feedCopilotUseCase;

    @PostMapping("/plan")
    public ResponseEntity<ApiResponse<FeedCopilotPlanResponse>> createPlan(
            @Valid @RequestBody FeedCopilotPlanRequest request,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(
                ApiResponse.success(feedCopilotUseCase.createPlan(request.toCommand(), userId)));
    }

    @PostMapping("/draft")
    public ResponseEntity<ApiResponse<FeedCopilotDraftResponse>> createDraft(
            @Valid @RequestBody FeedCopilotDraftRequest request,
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(
                ApiResponse.success(feedCopilotUseCase.createDraft(request.toCommand(), userId)));
    }
}
