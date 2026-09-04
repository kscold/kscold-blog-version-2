package com.kscold.blog.chat.domain.port.out;

import com.kscold.blog.notification.domain.model.MailMessage;

/** 읽지 않은 관리자 답장 알림 메일을 채팅 도메인의 값만으로 조립한다. */
public interface ChatReminderMailComposer {

    MailMessage buildUnreadReminder(
            String recipientEmail,
            String recipientName,
            String adminName,
            String latestContent,
            long unreadCount,
            String actionUrl);
}
