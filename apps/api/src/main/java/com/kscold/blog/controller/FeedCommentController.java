package com.kscold.blog.controller;

import com.kscold.blog.dto.request.FeedCommentCreateRequest;
import com.kscold.blog.dto.response.ApiResponse;
import com.kscold.blog.dto.response.FeedCommentResponse;
import com.kscold.blog.model.FeedComment;
import com.kscold.blog.service.FeedCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentService feedCommentService;

    /**
     * 댓글 목록 조회
     * GET /api/feeds/{feedId}/comments?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedCommentResponse>>> getComments(
            @PathVariable String feedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<FeedComment> comments = feedCommentService.getByFeedId(feedId, pageable);
        Page<FeedCommentResponse> response = comments.map(FeedCommentResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 댓글 작성
     * POST /api/feeds/{feedId}/comments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FeedCommentResponse>> createComment(
            @PathVariable String feedId,
            @Valid @RequestBody FeedCommentCreateRequest request
    ) {
        FeedComment comment = feedCommentService.create(feedId, request);
        FeedCommentResponse response = FeedCommentResponse.from(comment);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "댓글이 작성되었습니다"));
    }

    /**
     * 댓글 삭제 (비밀번호 확인)
     * DELETE /api/feeds/{feedId}/comments/{commentId}
     */
    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> body
    ) {
        String password = body.get("password");
        feedCommentService.delete(feedId, commentId, password);
        return ResponseEntity.ok(ApiResponse.successWithMessage("댓글이 삭제되었습니다"));
    }
}
