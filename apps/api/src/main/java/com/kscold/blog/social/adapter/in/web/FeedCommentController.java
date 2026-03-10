package com.kscold.blog.social.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.social.adapter.in.web.dto.FeedCommentResponse;
import com.kscold.blog.social.application.dto.DeleteCommentCommand;
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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<FeedComment> comments = feedCommentUseCase.getByFeedId(feedId, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments.map(FeedCommentResponse::from)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedCommentResponse>> createComment(
            @PathVariable String feedId,
            @Valid @RequestBody FeedCommentCreateCommand command
    ) {
        FeedComment comment = feedCommentUseCase.create(feedId, command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(FeedCommentResponse.from(comment), "댓글이 작성되었습니다"));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String feedId,
            @PathVariable String commentId,
            @Valid @RequestBody DeleteCommentCommand command
    ) {
        feedCommentUseCase.delete(feedId, commentId, command.getPassword());
        return ResponseEntity.noContent().build();
    }
}
