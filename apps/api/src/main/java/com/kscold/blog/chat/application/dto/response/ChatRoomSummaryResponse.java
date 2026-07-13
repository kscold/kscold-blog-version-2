package com.kscold.blog.chat.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ChatRoomSummaryResponse {

    private String roomId;

    private String username;

    private String lastMessage;

    private String lastTimestamp;

    private long messageCount;
}
