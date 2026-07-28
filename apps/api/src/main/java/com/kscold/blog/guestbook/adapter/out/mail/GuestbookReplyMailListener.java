package com.kscold.blog.guestbook.adapter.out.mail;

import com.kscold.blog.guestbook.application.event.GuestbookReplyCreatedEvent;
import com.kscold.blog.identity.domain.port.out.RecoveryMailSender;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** 방명록 답글이 커밋된 뒤 작성자 알림 메일을 전용 작업 큐에서 발송한다. */
@Slf4j
@Component
public class GuestbookReplyMailListener {

    private final RecoveryMailSender recoveryMailSender;
    private final GuestbookReplyEmailComposer composer;
    private final Executor guestbookReplyMailExecutor;

    public GuestbookReplyMailListener(
            RecoveryMailSender recoveryMailSender,
            GuestbookReplyEmailComposer composer,
            @Qualifier("guestbookReplyMailExecutor") Executor guestbookReplyMailExecutor) {
        this.recoveryMailSender = recoveryMailSender;
        this.composer = composer;
        this.guestbookReplyMailExecutor = guestbookReplyMailExecutor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(GuestbookReplyCreatedEvent event) {
        try {
            guestbookReplyMailExecutor.execute(() -> send(event));
        } catch (TaskRejectedException exception) {
            log.warn("방명록 답글 메일 작업 큐가 가득 차 전송을 건너뜁니다. entryId={}", event.entryId(), exception);
        }
    }

    private void send(GuestbookReplyCreatedEvent event) {
        if (!recoveryMailSender.isAvailable()) {
            return;
        }

        try {
            recoveryMailSender.send(
                    composer.compose(
                            event.recipientEmail(),
                            event.recipientName(),
                            event.originalContent(),
                            event.replyContent()));
        } catch (Exception exception) {
            log.warn("방명록 답글 알림 메일 전송을 건너뜁니다. entryId={}", event.entryId(), exception);
        }
    }
}
