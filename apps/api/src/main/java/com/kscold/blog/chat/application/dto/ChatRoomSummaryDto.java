package com.kscold.blog.chat.application.dto;

public record ChatRoomSummaryDto(
        String roomId,
        String username,
        String lastMessage,
        String lastTimestamp,
        long messageCount
) {}
