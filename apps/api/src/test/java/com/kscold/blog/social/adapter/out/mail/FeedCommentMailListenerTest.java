package com.kscold.blog.social.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.identity.domain.port.out.RecoveryMailSender;
import com.kscold.blog.social.application.event.FeedCommentCreatedEvent;
import com.kscold.blog.social.application.service.FeedMentionResolver;
import com.kscold.blog.social.domain.port.out.FeedRepository;
import java.util.concurrent.Executor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.task.TaskRejectedException;

@ExtendWith(MockitoExtension.class)
class FeedCommentMailListenerTest {

    @Mock private RecoveryMailSender recoveryMailSender;

    @Mock private FeedCommentEmailComposer composer;

    @Mock private FeedMentionResolver mentionResolver;

    @Mock private FeedRepository feedRepository;

    @Mock private Executor feedCommentMailExecutor;

    @InjectMocks private FeedCommentMailListener listener;

    @Test
    @DisplayName("댓글 커밋 후 메일 전송은 요청 스레드에서 기다리지 않고 작업 큐에 등록한다")
    void handleQueuesMailTaskWithoutSendingSynchronously() {
        FeedCommentCreatedEvent event =
                new FeedCommentCreatedEvent("feed-1", "comment-1", "user-1", "작성자", false, "댓글 내용");

        listener.handle(event);

        ArgumentCaptor<Runnable> taskCaptor = ArgumentCaptor.forClass(Runnable.class);
        verify(feedCommentMailExecutor).execute(taskCaptor.capture());
        verifyNoInteractions(recoveryMailSender, composer, mentionResolver, feedRepository);
    }

    @Test
    @DisplayName("메일 작업 큐가 가득 차도 댓글 작성 요청은 실패시키지 않는다")
    void handleDoesNotFailWhenMailTaskIsRejected() {
        doThrow(new TaskRejectedException("메일 작업 큐가 가득 찼습니다"))
                .when(feedCommentMailExecutor)
                .execute(any(Runnable.class));
        FeedCommentCreatedEvent event =
                new FeedCommentCreatedEvent("feed-1", "comment-1", "user-1", "작성자", false, "댓글 내용");

        assertThatCode(() -> listener.handle(event)).doesNotThrowAnyException();
    }
}
