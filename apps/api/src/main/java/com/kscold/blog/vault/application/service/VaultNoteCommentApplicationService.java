package com.kscold.blog.vault.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.vault.application.dto.NoteCommentCreateCommand;
import com.kscold.blog.vault.application.port.in.VaultNoteCommentUseCase;
import com.kscold.blog.vault.application.port.in.VaultNoteUseCase;
import com.kscold.blog.vault.domain.model.VaultNoteComment;
import com.kscold.blog.vault.domain.port.out.VaultNoteCommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VaultNoteCommentApplicationService implements VaultNoteCommentUseCase {

    private final VaultNoteCommentRepository commentRepository;
    private final VaultNoteUseCase vaultNoteUseCase;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public VaultNoteComment create(String noteId, NoteCommentCreateCommand command) {
        VaultNoteComment comment = VaultNoteComment.builder()
                .noteId(noteId)
                .authorName(command.getAuthorName())
                .authorPassword(passwordEncoder.encode(command.getAuthorPassword()))
                .content(command.getContent())
                .build();

        VaultNoteComment saved = commentRepository.save(comment);
        vaultNoteUseCase.incrementCommentCount(noteId);
        return saved;
    }

    public Page<VaultNoteComment> getByNoteId(String noteId, Pageable pageable) {
        return commentRepository.findByNoteId(noteId, pageable);
    }

    @Transactional
    public void delete(String noteId, String commentId, String password) {
        VaultNoteComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.vaultComment(commentId));

        if (!passwordEncoder.matches(password, comment.getAuthorPassword())) {
            throw InvalidRequestException.invalidInput("비밀번호가 일치하지 않습니다");
        }

        commentRepository.delete(comment);
        vaultNoteUseCase.decrementCommentCount(noteId);
    }
}
