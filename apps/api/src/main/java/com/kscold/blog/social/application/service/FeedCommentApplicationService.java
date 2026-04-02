package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.application.dto.FeedCommentCreateCommand;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
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
public class FeedCommentApplicationService implements FeedCommentUseCase {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedRepository feedRepository;
    private final UserRepository userRepository;

    @Transactional
    public FeedComment create(String feedId, FeedCommentCreateCommand command, String userId) {
        User user = getAuthenticatedUser(userId);
        claimAnonymousComments(feedId, user);

        FeedComment comment = FeedComment.builder()
                .feedId(feedId)
                .authorName(user.getDisplayName())
                .authorPassword(null)
                .userId(user.getId())
                .authorRole(user.getRole())
                .content(command.getContent())
                .build();

        FeedComment saved = feedCommentRepository.save(comment);
        feedRepository.incrementCommentCount(feedId);
        return saved;
    }

    public Page<FeedComment> getByFeedId(String feedId, Pageable pageable, String currentUserId) {
        if (currentUserId != null && !currentUserId.isBlank()) {
            userRepository.findById(currentUserId).ifPresent(user -> claimAnonymousComments(feedId, user));
        }
        return feedCommentRepository.findByFeedId(feedId, pageable);
    }

    @Transactional
    public void delete(String feedId, String commentId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);
        claimAnonymousComments(feedId, user);

        FeedComment comment = feedCommentRepository.findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.feedComment(commentId));

        boolean canDelete = user.getRole() == User.Role.ADMIN || user.getId().equals(comment.getUserId());
        if (!canDelete) {
            throw InvalidRequestException.invalidInput("본인이 작성한 댓글만 삭제할 수 있습니다");
        }

        feedCommentRepository.delete(comment);
        feedRepository.decrementCommentCount(feedId);
    }

    private User getAuthenticatedUser(String userId) {
        if (userId == null || userId.isBlank()) {
            throw InvalidRequestException.invalidInput("로그인이 필요합니다");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.user(userId));
    }

    private void claimAnonymousComments(String feedId, User user) {
        List<String> authorNames = candidateAuthorNames(user);
        if (authorNames.isEmpty()) {
            return;
        }

        List<FeedComment> commentsToClaim = feedCommentRepository.findAnonymousByFeedIdAndAuthorNames(feedId, authorNames);
        if (commentsToClaim.isEmpty()) {
            return;
        }

        commentsToClaim.forEach(comment -> {
            comment.setUserId(user.getId());
            comment.setAuthorRole(user.getRole());
            comment.setAuthorPassword(null);
            comment.setAuthorName(user.getDisplayName());
        });
        feedCommentRepository.saveAll(commentsToClaim);
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
