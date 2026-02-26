package com.kscold.blog.service;

import com.kscold.blog.dto.request.FeedCommentCreateRequest;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.VaultNoteComment;
import com.kscold.blog.repository.VaultNoteCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VaultNoteCommentService {

    private final VaultNoteCommentRepository commentRepository;
    private final VaultNoteService vaultNoteService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public VaultNoteComment create(String noteId, FeedCommentCreateRequest request) {
        VaultNoteComment comment = VaultNoteComment.builder()
                .noteId(noteId)
                .authorName(request.getAuthorName())
                .authorPassword(passwordEncoder.encode(request.getAuthorPassword()))
                .content(request.getContent())
                .build();

        VaultNoteComment saved = commentRepository.save(comment);
        vaultNoteService.incrementCommentCount(noteId);
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
        vaultNoteService.decrementCommentCount(noteId);
    }
}
