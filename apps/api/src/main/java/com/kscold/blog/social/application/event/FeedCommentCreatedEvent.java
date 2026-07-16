package com.kscold.blog.social.application.event;

/** 피드 댓글이 작성된 뒤(커밋 후) 알림 메일을 보내기 위한 애플리케이션 이벤트. */
public record FeedCommentCreatedEvent(
        String feedId,
        String commentId,
        String authorUserId,
        String authorName,
        boolean authorIsAdmin,
        String content) {}
