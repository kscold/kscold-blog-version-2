package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.social.application.dto.FeedCommentCreateCommand;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.application.port.in.FeedUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
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
public class FeedCommentApplicationService implements FeedCommentUseCase {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedUseCase feedUseCase;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public FeedComment create(String feedId, FeedCommentCreateCommand command) {
        FeedComment comment = FeedComment.builder()
                .feedId(feedId)
                .authorName(command.getAuthorName())
                .authorPassword(passwordEncoder.encode(command.getAuthorPassword()))
                .content(command.getContent())
                .build();

        FeedComment saved = feedCommentRepository.save(comment);
        feedUseCase.incrementCommentCount(feedId);
        return saved;
    }

    public Page<FeedComment> getByFeedId(String feedId, Pageable pageable) {
        return feedCommentRepository.findByFeedId(feedId, pageable);
    }

    @Transactional
    public void delete(String feedId, String commentId, String password) {
        FeedComment comment = feedCommentRepository.findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.feedComment(commentId));

        if (!passwordEncoder.matches(password, comment.getAuthorPassword())) {
            throw InvalidRequestException.invalidInput("비밀번호가 일치하지 않습니다");
        }

        feedCommentRepository.delete(comment);
        feedUseCase.decrementCommentCount(feedId);
    }
}
