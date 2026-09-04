package com.kscold.blog.notification.adapter.in.web.dto.response;

import com.kscold.blog.notification.domain.model.MessageDeliveryStatus;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 공급자에게 물어본 실제 도달 결과. 무엇이 어디까지 갔는지 확인할 때 쓴다. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDeliveryStatusResponse {

    private String messageId;
    private String groupId;
    private String recipient;
    private String statusCode;
    private String status;
    private boolean delivered;

    /** 실제로 나간 최종 문구. 변수가 채워진 상태다. */
    private String text;

    private String sentAt;
    private String receivedAt;
    private List<String> logs;

    public static MessageDeliveryStatusResponse from(MessageDeliveryStatus status) {
        return MessageDeliveryStatusResponse.builder()
                .messageId(status.messageId())
                .groupId(status.groupId())
                .recipient(status.recipient())
                .statusCode(status.statusCode())
                .status(status.status())
                .delivered(status.delivered())
                .text(status.text())
                .sentAt(status.sentAt())
                .receivedAt(status.receivedAt())
                .logs(status.logs())
                .build();
    }

    public static List<MessageDeliveryStatusResponse> from(List<MessageDeliveryStatus> statuses) {
        return statuses.stream().map(MessageDeliveryStatusResponse::from).toList();
    }
}
