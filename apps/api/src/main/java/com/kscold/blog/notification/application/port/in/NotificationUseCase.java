package com.kscold.blog.notification.application.port.in;

import com.kscold.blog.notification.domain.model.NotificationMessage;

/**
 * 다른 바운디드 컨텍스트가 소비하는 알림 계약(published contract).
 *
 * <p>회원가입·오류 등 단방향 알림을 보내고 싶은 쪽은 이 유스케이스만 주입받으면 됨. 디스코드/웹훅 같은 전송 수단은 이 뒤로 감춘다.
 */
public interface NotificationUseCase {

    /** 알림을 보냄. 전송 실패는 호출한 쪽으로 전파하지 않음. */
    void notify(NotificationMessage message);
}
