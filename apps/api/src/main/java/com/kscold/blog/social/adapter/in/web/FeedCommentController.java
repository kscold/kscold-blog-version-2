package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.shared.web.BoundedPageRequestFactory;
import com.kscold.blog.shared.web.ClientIdentifierResolver;
import com.kscold.blog.social.adapter.in.web.dto.response.FeedCommentResponse;
import com.kscold.blog.social.adapter.in.web.dto.response.MentionableUserResponse;
import com.kscold.blog.social.application.dto.command.FeedCommentCreateCommand;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentUseCase feedCommentUseCase;
    private final ClientIdentifierResolver clientIdentifierResolver;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedCommentResponse>>> getComments(
            @PathVariable String feedId,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable =
                BoundedPageRequestFactory.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<FeedComment> comments = feedCommentUseCase.getByFeedId(feedId, pageable, userId);
        boolean isAdmin = hasAdminRole();
        String identifier = resolveIdentifier(userId, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        comments.map(
                                comment ->
                                        FeedCommentResponse.from(
                                                comment, userId, isAdmin, identifier))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedCommentResponse>> createComment(
            @PathVariable String feedId,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request,
            @Valid @RequestBody FeedCommentCreateCommand command) {
        FeedComment comment = feedCommentUseCase.create(feedId, command, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                FeedCommentResponse.from(
                                        comment,
                                        userId,
                                        hasAdminRole(),
                                        resolveIdentifier(userId, request)),
                                "댓글이 작성되었습니다"));
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<ApiResponse<FeedCommentResponse>> toggleLike(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @AuthenticationPrincipal String userId,
            HttpServletRequest request) {
        String identifier = resolveIdentifier(userId, request);
        FeedComment comment = feedCommentUseCase.toggleLike(feedId, commentId, identifier);
        return ResponseEntity.ok(
                ApiResponse.success(
                        FeedCommentResponse.from(comment, userId, hasAdminRole(), identifier)));
    }

    @GetMapping("/mentionable")
    public ResponseEntity<ApiResponse<List<MentionableUserResponse>>> getMentionableUsers(
            @PathVariable String feedId) {
        List<MentionableUserResponse> users =
                feedCommentUseCase.getMentionableUsers(feedId).stream()
                        .map(MentionableUserResponse::from)
                        .toList();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @AuthenticationPrincipal String userId) {
        feedCommentUseCase.delete(feedId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

    /** 로그인 유저 → userId, 비로그인 → 클라이언트 식별자. 피드 좋아요와 같은 규칙. */
    private String resolveIdentifier(String userId, HttpServletRequest request) {
        return (userId != null) ? userId : clientIdentifierResolver.resolve(request);
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null
                && auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
