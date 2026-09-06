package com.kscold.blog.vault.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.vault.application.dto.command.NoteCommentCreateCommand;
import com.kscold.blog.vault.application.port.in.VaultNoteCommentUseCase;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import com.kscold.blog.vault.domain.port.out.VaultNoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaultNoteCommentApplicationService implements VaultNoteCommentUseCase {

    private final VaultNoteCommentRepository commentRepository;
    private final VaultNoteRepository vaultNoteRepository;
    private final UserRepository userRepository;

    @Transactional
    public VaultNoteComment create(String noteId, NoteCommentCreateCommand command, String userId) {
        User user = getAuthenticatedUser(userId);

        VaultNoteComment comment =
                VaultNoteComment.builder()
                        .noteId(noteId)
                        .authorName(user.getDisplayName())
                        .authorPassword(null)
                        .userId(user.getId())
                        .authorRole(user.getRole())
                        .content(command.getContent())
                        .build();

        VaultNoteComment saved = commentRepository.save(comment);
        vaultNoteRepository.incrementCommentCount(noteId);
        return saved;
    }

    public Page<VaultNoteComment> getByNoteId(String noteId, Pageable pageable) {
        return commentRepository.findByNoteId(noteId, pageable);
    }

    @Transactional
    public void delete(String noteId, String commentId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);

        VaultNoteComment comment =
                commentRepository
                        .findById(commentId)
                        .orElseThrow(() -> ResourceNotFoundException.vaultComment(commentId));
        if (!noteId.equals(comment.getNoteId())) {
            throw InvalidRequestException.invalidInput("이 노트의 댓글이 아닙니다");
        }

        boolean canDelete =
                user.getRole() == User.Role.ADMIN || user.getId().equals(comment.getUserId());
        if (!canDelete) {
            throw InvalidRequestException.invalidInput("본인이 작성한 댓글만 삭제할 수 있습니다");
        }

        commentRepository.delete(comment);
        vaultNoteRepository.decrementCommentCount(noteId);
    }

    private User getAuthenticatedUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다");
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }
}
