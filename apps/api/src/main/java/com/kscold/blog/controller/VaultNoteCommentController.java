package com.kscold.blog.controller;

import com.kscold.blog.dto.request.FeedCommentCreateRequest;
import com.kscold.blog.dto.response.ApiResponse;

import com.kscold.blog.model.VaultNoteComment;
import com.kscold.blog.service.VaultNoteCommentService;
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
@RequestMapping("/api/vault/notes/{noteId}/comments")
@RequiredArgsConstructor
public class VaultNoteCommentController {

    private final VaultNoteCommentService commentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VaultNoteCommentResponse>>> getComments(
            @PathVariable String noteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<VaultNoteComment> comments = commentService.getByNoteId(noteId, pageable);
        Page<VaultNoteCommentResponse> response = comments.map(VaultNoteCommentResponse::from);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VaultNoteCommentResponse>> createComment(
            @PathVariable String noteId,
            @Valid @RequestBody FeedCommentCreateRequest request
    ) {
        VaultNoteComment comment = commentService.create(noteId, request);
        VaultNoteCommentResponse response = VaultNoteCommentResponse.from(comment);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "댓글이 작성되었습니다"));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable String noteId,
            @PathVariable String commentId,
            @RequestBody Map<String, String> body
    ) {
        commentService.delete(noteId, commentId, body.get("password"));
        return ResponseEntity.ok(ApiResponse.successWithMessage("댓글이 삭제되었습니다"));
    }

    /**
     * VaultNoteComment -> Response 변환용 내부 record
     */
    private record VaultNoteCommentResponse(
            String id,
            String noteId,
            String authorName,
            Boolean isAdmin,
            String content,
            java.time.LocalDateTime createdAt
    ) {
        static VaultNoteCommentResponse from(VaultNoteComment c) {
            return new VaultNoteCommentResponse(
                    c.getId(), c.getNoteId(), c.getAuthorName(),
                    c.getUserId() != null, c.getContent(), c.getCreatedAt()
            );
        }
    }
}
