package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.application.dto.DeleteNoteCommentCommand;
import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
import com.kscold.blog.vault.application.port.in.VaultNoteCommentUseCase;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/vault/notes/{noteId}/comments")
@RequiredArgsConstructor
public class VaultNoteCommentController {

    private final VaultNoteCommentUseCase commentUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VaultNoteCommentResponse>>> getComments(
            @PathVariable String noteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<VaultNoteComment> comments = commentUseCase.getByNoteId(noteId, pageable);
        return ResponseEntity.ok(ApiResponse.success(comments.map(VaultNoteCommentResponse::from)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VaultNoteCommentResponse>> createComment(
            @PathVariable String noteId,
            @Valid @RequestBody NoteCommentCreateCommand command
    ) {
        VaultNoteComment comment = commentUseCase.create(noteId, command);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(VaultNoteCommentResponse.from(comment), "댓글이 작성되었습니다"));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String noteId,
            @PathVariable String commentId,
            @Valid @RequestBody DeleteNoteCommentCommand command
    ) {
        commentUseCase.delete(noteId, commentId, command.getPassword());
        return ResponseEntity.noContent().build();
    }

    private record VaultNoteCommentResponse(
            String id,
            String noteId,
            String authorName,
            Boolean isAdmin,
            String content,
            LocalDateTime createdAt
    ) {
        static VaultNoteCommentResponse from(VaultNoteComment c) {
            return new VaultNoteCommentResponse(
                    c.getId(), c.getNoteId(), c.getAuthorName(),
                    c.getUserId() != null, c.getContent(), c.getCreatedAt()
            );
        }
    }
}
