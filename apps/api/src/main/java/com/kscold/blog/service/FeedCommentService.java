package com.kscold.blog.service;

import com.kscold.blog.dto.request.FeedCommentCreateRequest;
import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.model.FeedComment;
import com.kscold.blog.repository.FeedCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FeedCommentService {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedService feedService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public FeedComment create(String feedId, FeedCommentCreateRequest request) {
        FeedComment comment = FeedComment.builder()
                .feedId(feedId)
                .authorName(request.getAuthorName())
                .authorPassword(passwordEncoder.encode(request.getAuthorPassword()))
                .content(request.getContent())
                .build();

        FeedComment saved = feedCommentRepository.save(comment);
        feedService.incrementCommentCount(feedId);
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
        feedService.decrementCommentCount(feedId);
    }
}
