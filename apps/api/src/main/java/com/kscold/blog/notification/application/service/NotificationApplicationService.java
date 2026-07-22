package com.kscold.blog.notification.application.service;

import com.kscold.blog.notification.application.port.in.NotificationUseCase;
import com.kscold.blog.notification.domain.model.NotificationMessage;
import com.kscold.blog.notification.domain.port.out.NotificationSenderPort;
import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Service;

/**
 * 알림 유스케이스 구현.
 *
 * <p>알림은 부가 기능이므로 호출한 요청을 절대 지연시키거나 실패시키지 않는다. 전용 실행기에 넘겨 비동기로 보내고, 큐가 가득 차거나 전송이 실패하면 기록만 남긴다.
 */
@Slf4j
@Service
public class NotificationApplicationService implements NotificationUseCase {

    private final NotificationSenderPort senderPort;
    private final Executor notificationExecutor;

    public NotificationApplicationService(
            NotificationSenderPort senderPort,
            @Qualifier("notificationExecutor") Executor notificationExecutor) {
        this.senderPort = senderPort;
        this.notificationExecutor = notificationExecutor;
    }

    @Override
    public void notify(NotificationMessage message) {
        if (message == null || !senderPort.isAvailable()) {
            return;
        }

        try {
            notificationExecutor.execute(() -> sendQuietly(message));
        } catch (TaskRejectedException exception) {
            log.warn("알림 작업 큐가 가득 차 전송을 건너뜁니다. channel={}", message.channel(), exception);
        }
    }

    private void sendQuietly(NotificationMessage message) {
        try {
            senderPort.send(message);
        } catch (Exception exception) {
            log.warn("알림 전송에 실패했습니다. channel={}", message.channel(), exception);
        }
    }
}
