package com.kscold.blog.stackshare.adapter.in.web.dto.response;

import com.kscold.blog.stackshare.domain.model.StackShareSendResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StackShareNotificationResponse {

    private String groupId;
    private int requestedCount;
    private int acceptedCount;

    public static StackShareNotificationResponse from(StackShareSendResult result) {
        return StackShareNotificationResponse.builder()
                .groupId(result.groupId())
                .requestedCount(result.requestedCount())
                .acceptedCount(result.acceptedCount())
                .build();
    }
}
