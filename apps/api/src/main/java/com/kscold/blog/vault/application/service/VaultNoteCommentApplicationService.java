package com.kscold.blog.vault.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
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

import java.util.ArrayList;
import java.util.List;

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
        claimAnonymousComments(noteId, user);

        VaultNoteComment comment = VaultNoteComment.builder()
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

    public Page<VaultNoteComment> getByNoteId(String noteId, Pageable pageable, String currentUserId) {
        if (currentUserId != null && !currentUserId.isBlank()) {
            userRepository.findById(currentUserId).ifPresent(user -> claimAnonymousComments(noteId, user));
        }
        return commentRepository.findByNoteId(noteId, pageable);
    }

    @Transactional
    public void delete(String noteId, String commentId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);
        claimAnonymousComments(noteId, user);

        VaultNoteComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.vaultComment(commentId));

        boolean canDelete = user.getRole() == User.Role.ADMIN || user.getId().equals(comment.getUserId());
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

        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }

    private void claimAnonymousComments(String noteId, User user) {
        List<String> authorNames = candidateAuthorNames(user);
        if (authorNames.isEmpty()) {
            return;
        }

        List<VaultNoteComment> commentsToClaim = commentRepository.findAnonymousByNoteIdAndAuthorNames(noteId, authorNames);
        if (commentsToClaim.isEmpty()) {
            return;
        }

        commentsToClaim.forEach(comment -> {
            comment.setUserId(user.getId());
            comment.setAuthorRole(user.getRole());
            comment.setAuthorPassword(null);
            comment.setAuthorName(user.getDisplayName());
        });
        commentRepository.saveAll(commentsToClaim);
    }

    private List<String> candidateAuthorNames(User user) {
        List<String> names = new ArrayList<>();
        if (user.getProfile() != null && user.getProfile().getDisplayName() != null && !user.getProfile().getDisplayName().isBlank()) {
            names.add(user.getProfile().getDisplayName().trim());
        }
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            names.add(user.getUsername().trim());
        }
        return names.stream().distinct().toList();
    }
}
