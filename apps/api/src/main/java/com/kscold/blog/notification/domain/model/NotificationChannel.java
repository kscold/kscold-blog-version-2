package com.kscold.blog.notification.domain.model;

/**
 * 단방향 알림을 보낼 디스코드 채널 종류.
 *
 * <p>채널 ID 대신 이 종류를 쓰고, 실제 채널은 설정된 이름으로 찾거나 없으면 만든다. 채널 ID를 손으로 복사해 환경변수에 넣는 작업을 없애기 위함.
 */
public enum NotificationChannel {

    /** 신규 회원가입 알림 */
    SIGNUP,

    /** 서버 오류 알림 */
    ERROR
}
