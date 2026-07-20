package com.kscold.blog.chat.domain.port.out;

/** 채팅 메시지를 외부 채널(디스코드 등)로 알리는 아웃바운드 포트 */
public interface ChatNotificationPort {

    /** 방문자 메시지 또는 웹 관리자 답장을 외부 채널로 전달함. */
    void notifyMessage(String roomId, String username, String content, boolean fromAdmin);

    /** 입장/퇴장 등 시스템 이벤트를 외부 채널로 전달함. */
    void notifySystem(String roomId, String content);
}
