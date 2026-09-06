package com.kscold.blog.social.application.service;

import com.kscold.blog.exception.InvalidRequestException;
import com.kscold.blog.exception.ResourceNotFoundException;
import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.UserRepository;
import com.kscold.blog.social.application.dto.command.FeedCommentCreateCommand;
import com.kscold.blog.social.application.event.FeedCommentCreatedEvent;
import com.kscold.blog.social.application.port.in.FeedCommentUseCase;
import com.kscold.blog.social.domain.model.FeedComment;
import com.kscold.blog.social.domain.port.out.FeedCommentRepository;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedCommentApplicationService implements FeedCommentUseCase {

    private final FeedCommentRepository feedCommentRepository;
    private final FeedRepository feedRepository;
    private final UserRepository userRepository;
    private final FeedMentionResolver mentionResolver;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public FeedComment create(String feedId, FeedCommentCreateCommand command, String userId) {
        User user = getAuthenticatedUser(userId);

        FeedComment comment =
                FeedComment.builder()
                        .feedId(feedId)
                        .authorName(user.getDisplayName())
                        .authorPassword(null)
                        .userId(user.getId())
                        .authorRole(user.getRole())
                        .content(command.getContent())
                        .build();

        FeedComment saved = feedCommentRepository.save(comment);
        feedRepository.incrementCommentCount(feedId);

        // 커밋 이후 알림 메일 발송(주인 알림 + @언급 알림)
        eventPublisher.publishEvent(
                new FeedCommentCreatedEvent(
                        feedId,
                        saved.getId(),
                        user.getId(),
                        user.getDisplayName(),
                        user.getRole() == User.Role.ADMIN,
                        saved.getContent()));

        return saved;
    }

    @Override
    public List<User> getMentionableUsers(String feedId) {
        return mentionResolver.mentionableUsers(feedId);
    }

    public Page<FeedComment> getByFeedId(String feedId, Pageable pageable) {
        return feedCommentRepository.findByFeedId(feedId, pageable);
    }

    @Transactional
    public void delete(String feedId, String commentId, String currentUserId) {
        User user = getAuthenticatedUser(currentUserId);

        FeedComment comment =
                feedCommentRepository
                        .findById(commentId)
                        .orElseThrow(() -> ResourceNotFoundException.feedComment(commentId));
        if (!feedId.equals(comment.getFeedId())) {
            throw InvalidRequestException.invalidInput("이 글의 댓글이 아닙니다");
        }

        boolean canDelete =
                user.getRole() == User.Role.ADMIN || user.getId().equals(comment.getUserId());
        if (!canDelete) {
            throw InvalidRequestException.invalidInput("본인이 작성한 댓글만 삭제할 수 있습니다");
        }

        feedCommentRepository.delete(comment);
        feedRepository.decrementCommentCount(feedId);
    }

    /** 좋아요는 로그인하지 않아도 누를 수 있어 사용자 확인 없이 식별자만으로 처리한다. */
    @Transactional
    public FeedComment toggleLike(String feedId, String commentId, String identifier) {
        FeedComment comment =
                feedCommentRepository
                        .findById(commentId)
                        .orElseThrow(() -> ResourceNotFoundException.feedComment(commentId));
        // 다른 글의 댓글 아이디로 좋아요가 눌리지 않도록 소속을 확인한다.
        if (!comment.getFeedId().equals(feedId)) {
            throw InvalidRequestException.invalidInput("이 글의 댓글이 아닙니다");
        }

        feedCommentRepository.toggleLike(commentId, identifier);
        return feedCommentRepository
                .findById(commentId)
                .orElseThrow(() -> ResourceNotFoundException.feedComment(commentId));
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
