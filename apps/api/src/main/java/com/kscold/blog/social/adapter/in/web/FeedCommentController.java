package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.adapter.in.web.dto.FeedCommentResponse;
import com.kscold.blog.social.application.dto.FeedCommentCreateCommand;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentUseCase feedCommentUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedCommentResponse>>> getComments(
            @PathVariable String feedId,
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<FeedComment> comments = feedCommentUseCase.getByFeedId(feedId, pageable, userId);
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(ApiResponse.success(comments.map(comment -> FeedCommentResponse.from(comment, userId, isAdmin))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedCommentResponse>> createComment(
            @PathVariable String feedId,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody FeedCommentCreateCommand command
    ) {
        FeedComment comment = feedCommentUseCase.create(feedId, command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(FeedCommentResponse.from(comment, userId, hasAdminRole()), "댓글이 작성되었습니다"));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @AuthenticationPrincipal String userId
    ) {
        feedCommentUseCase.delete(feedId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
