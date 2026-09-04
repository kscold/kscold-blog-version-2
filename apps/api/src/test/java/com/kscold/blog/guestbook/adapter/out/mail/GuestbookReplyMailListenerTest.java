package com.kscold.blog.guestbook.adapter.out.mail;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.kscold.blog.guestbook.application.event.GuestbookReplyCreatedEvent;
import com.kscold.blog.notification.domain.port.out.MailSender;
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
class GuestbookReplyMailListenerTest {

    @Mock private MailSender recoveryMailSender;

    @Mock private GuestbookReplyEmailComposer composer;

    @Mock private Executor guestbookReplyMailExecutor;

    @InjectMocks private GuestbookReplyMailListener listener;

    @Test
    @DisplayName("답글 커밋 후 메일 전송은 요청 스레드에서 기다리지 않고 작업 큐에 등록한다")
    void handleQueuesMailTaskWithoutSendingSynchronously() {
        GuestbookReplyCreatedEvent event = event();

        listener.handle(event);

        ArgumentCaptor<Runnable> taskCaptor = ArgumentCaptor.forClass(Runnable.class);
        verify(guestbookReplyMailExecutor).execute(taskCaptor.capture());
        verifyNoInteractions(recoveryMailSender, composer);
    }

    @Test
    @DisplayName("메일 작업 큐가 가득 차도 방명록 답글 저장은 실패시키지 않는다")
    void handleDoesNotFailWhenMailTaskIsRejected() {
        doThrow(new TaskRejectedException("메일 작업 큐가 가득 찼습니다"))
                .when(guestbookReplyMailExecutor)
                .execute(any(Runnable.class));

        assertThatCode(() -> listener.handle(event())).doesNotThrowAnyException();
    }

    private GuestbookReplyCreatedEvent event() {
        return new GuestbookReplyCreatedEvent(
                "entry-1", "visitor@example.com", "방문자", "원문", "관리자 답글");
    }
}
