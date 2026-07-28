package com.kscold.blog.guestbook.application.event;

/** 방명록 답글 저장이 끝난 뒤 작성자에게 알림 메일을 보내기 위한 이벤트. */
public record GuestbookReplyCreatedEvent(
        String entryId,
        String recipientEmail,
        String recipientName,
        String originalContent,
        String replyContent) {}
