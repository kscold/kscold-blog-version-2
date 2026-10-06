package com.kscold.blog.architecture;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.kscold.blog.guestbook.adapter.out.mail.GuestbookReplyEmailComposer;
import com.kscold.blog.guestbook.adapter.out.mail.GuestbookReplyMailListener;
import com.kscold.blog.guestbook.application.event.GuestbookReplyCreatedEvent;
import com.kscold.blog.notification.domain.port.out.MailSender;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 발행한 이벤트가 스프링을 거쳐 커밋 후 리스너까지 실제로 전달되는지 확인한다.
 *
 * <p>리스너 단위 테스트는 메서드를 직접 부르기 때문에, 프레임워크가 리스너를 호출하지 않게 된 문제(알림 메일 미발송)를 잡지 못했다. 트랜잭션 관리자가 없는 이
 * 애플리케이션과 같은 조건으로 컨텍스트를 띄워 확인한다.
 */
class AfterCommitListenerDispatchTest {

    private static final GuestbookReplyCreatedEvent EVENT =
            new GuestbookReplyCreatedEvent("entry-1", "visitor@example.com", "방문자", "원문", "관리자 답글");

    @Test
    @DisplayName("트랜잭션 관리자가 없어도 발행한 이벤트가 알림 메일 리스너까지 전달된다")
    void deliversEventsToMailListenersWithoutTransactionManager() {
        MailSender mailSender = mock(MailSender.class);
        when(mailSender.isAvailable()).thenReturn(true);

        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext()) {
            context.register(GuestbookReplyMailListener.class);
            context.registerBean(MailSender.class, () -> mailSender);
            context.registerBean(
                    GuestbookReplyEmailComposer.class,
                    () -> mock(GuestbookReplyEmailComposer.class));
            context.registerBean("guestbookReplyMailExecutor", Executor.class, () -> Runnable::run);
            context.refresh();

            context.publishEvent(EVENT);
        }

        verify(mailSender).send(any());
    }

    @Test
    @DisplayName("fallbackExecution 없이 선언한 커밋 후 리스너는 트랜잭션 밖의 이벤트를 받지 못한다")
    void skipsListenersDeclaredWithoutFallbackExecution() {
        try (AnnotationConfigApplicationContext context =
                new AnnotationConfigApplicationContext(CommitOnlyListener.class)) {
            context.publishEvent(EVENT);

            assertThat(context.getBean(CommitOnlyListener.class).received).hasValue(0);
        }
    }

    /** 규칙을 어긴 선언. 스프링이 이런 리스너를 조용히 건너뛴다는 사실을 테스트로 남겨 둔다. */
    static class CommitOnlyListener {

        final AtomicInteger received = new AtomicInteger();

        @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
        public void handle(GuestbookReplyCreatedEvent event) {
            received.incrementAndGet();
        }
    }
}
