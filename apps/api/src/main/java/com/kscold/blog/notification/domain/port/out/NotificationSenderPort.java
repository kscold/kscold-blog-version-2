package com.kscold.blog.notification.domain.port.out;

import com.kscold.blog.notification.domain.model.NotificationMessage;

/** 단방향 알림을 외부 채널(디스코드 웹훅 등)로 내보내는 아웃바운드 포트 */
public interface NotificationSenderPort {

    /** 알림 전송이 가능한 상태인지(웹훅이 준비됐는지) */
    boolean isAvailable();

    /** 알림 한 건을 전송함. 실패해도 호출한 쪽 흐름을 막지 않아야 함. */
    void send(NotificationMessage message);
}
