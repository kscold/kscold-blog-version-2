package com.kscold.blog.social.adapter.out.mail;

import com.kscold.blog.identity.domain.model.User;
import com.kscold.blog.identity.domain.port.out.RecoveryMailSender;
import com.kscold.blog.social.application.event.FeedCommentCreatedEvent;
import com.kscold.blog.social.application.service.FeedMentionResolver;
import com.kscold.blog.social.domain.model.Feed;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 피드 댓글 작성 후(커밋 이후) 알림 메일을 보낸다.
 *
 * <ul>
 *   <li>블로그 주인(admin)에게: 새 댓글 알림 — 단, 주인 본인이 단 댓글은 제외
 *   <li>본문에서 @언급된 사용자 각자에게: 언급 알림
 * </ul>
 */
@Slf4j
@Component
public class FeedCommentMailListener {

    private final RecoveryMailSender recoveryMailSender;
    private final FeedCommentEmailComposer composer;
    private final FeedMentionResolver mentionResolver;
    private final FeedRepository feedRepository;

    private final Executor feedCommentMailExecutor;

    @Value("${admin-night.admin-email:developerkscold@gmail.com}")
    private String adminEmail;

    public FeedCommentMailListener(
            RecoveryMailSender recoveryMailSender,
            FeedCommentEmailComposer composer,
            FeedMentionResolver mentionResolver,
            FeedRepository feedRepository,
            @Qualifier("feedCommentMailExecutor") Executor feedCommentMailExecutor) {
        this.recoveryMailSender = recoveryMailSender;
        this.composer = composer;
        this.mentionResolver = mentionResolver;
        this.feedRepository = feedRepository;
        this.feedCommentMailExecutor = feedCommentMailExecutor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(FeedCommentCreatedEvent event) {
        try {
            // 댓글 저장 요청은 기다리지 않고, 커밋이 끝난 뒤 메일 작업만 전용 큐에 등록한다.
            feedCommentMailExecutor.execute(() -> sendNotifications(event));
        } catch (TaskRejectedException exception) {
            // 혼잡할 때 요청 스레드에서 메일을 대신 보내면 댓글 UX가 다시 느려지므로 기록만 남긴다.
            log.warn("피드 댓글 알림 작업 큐가 가득 차 전송을 건너뜁니다. feedId={}", event.feedId(), exception);
        }
    }

    private void sendNotifications(FeedCommentCreatedEvent event) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            String postPreview = resolvePostPreview(event.feedId());
            Set<String> notified = new HashSet<>();

            // 1) 주인(admin) 새 댓글 알림 — 주인 본인 댓글이면 생략
            if (!event.authorIsAdmin() && adminEmail != null && !adminEmail.isBlank()) {
                recoveryMailSender.send(
                        composer.adminNewComment(
                                adminEmail,
                                event.authorName(),
                                event.content(),
                                event.feedId(),
                                postPreview));
                notified.add(adminEmail.toLowerCase());
            }

            // 2) @언급된 사용자 각자에게 언급 알림
            List<User> candidates =
                    mentionResolver.mentionableUsers(event.feedId()).stream()
                            .filter(user -> !user.getId().equals(event.authorUserId())) // 본인 제외
                            .toList();
            List<User> mentioned = mentionResolver.detectMentioned(event.content(), candidates);

            for (User user : mentioned) {
                String email = user.getEmail();
                if (email == null || email.isBlank()) {
                    continue;
                }
                if (!notified.add(email.toLowerCase())) {
                    continue; // 이미 admin 알림으로 보낸 주소면 중복 방지
                }
                recoveryMailSender.send(
                        composer.mention(
                                email,
                                event.authorName(),
                                event.content(),
                                event.feedId(),
                                postPreview));
            }
        } catch (Exception exception) {
            log.warn("피드 댓글 알림 메일 전송을 건너뜁니다. feedId={}", event.feedId(), exception);
        }
    }

    private String resolvePostPreview(String feedId) {
        return feedRepository
                .findById(feedId)
                .map(Feed::getContent)
                .map(content -> content.split("\n", 2)[0].strip())
                .map(line -> line.length() > 40 ? line.substring(0, 40) + "…" : line)
                .filter(line -> !line.isBlank())
                .orElse(null);
    }
}
