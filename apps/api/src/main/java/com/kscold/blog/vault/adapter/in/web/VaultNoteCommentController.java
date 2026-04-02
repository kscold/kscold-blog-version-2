package com.kscold.blog.vault.adapter.in.web;

import com.kscold.blog.shared.web.ApiResponse;
import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
import com.kscold.blog.vault.adapter.in.web.dto.VaultNoteCommentResponse;
import com.kscold.blog.vault.application.port.in.VaultNoteCommentUseCase;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/vault/notes/{noteId}/comments")
@RequiredArgsConstructor
public class VaultNoteCommentController {

    private final VaultNoteCommentUseCase commentUseCase;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VaultNoteCommentResponse>>> getComments(
            @PathVariable String noteId,
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<VaultNoteComment> comments = commentUseCase.getByNoteId(noteId, pageable, userId);
        boolean isAdmin = hasAdminRole();
        return ResponseEntity.ok(ApiResponse.success(comments.map(comment -> VaultNoteCommentResponse.from(comment, userId, isAdmin))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VaultNoteCommentResponse>> createComment(
            @PathVariable String noteId,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody NoteCommentCreateCommand command
    ) {
        VaultNoteComment comment = commentUseCase.create(noteId, command, userId);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(VaultNoteCommentResponse.from(comment, userId, hasAdminRole()), "댓글이 작성되었습니다"));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String noteId,
            @PathVariable String commentId,
            @AuthenticationPrincipal String userId
    ) {
        commentUseCase.delete(noteId, commentId, userId);
        return ResponseEntity.noContent().build();
    }

    private boolean hasAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
