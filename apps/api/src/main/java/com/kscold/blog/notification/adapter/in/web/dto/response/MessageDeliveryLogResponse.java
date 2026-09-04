package com.kscold.blog.notification.adapter.in.web.dto.response;

import com.kscold.blog.notification.domain.model.MessageDeliveryLog;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDeliveryLogResponse {

    private String id;
    private MessageDeliveryLog.Channel channel;
    private String purpose;
    private String recipient;
    private String recipientName;
    private String summary;
    private MessageDeliveryLog.Status status;
    private String failureReason;

    /** 이 값이 있으면 공급자에게 실제 도달 상태를 다시 물어볼 수 있다. */
    private String providerGroupId;

    private LocalDateTime createdAt;

    public static MessageDeliveryLogResponse from(MessageDeliveryLog log) {
        return MessageDeliveryLogResponse.builder()
                .id(log.getId())
                .channel(log.getChannel())
                .purpose(log.getPurpose())
                .recipient(log.getRecipient())
                .recipientName(log.getRecipientName())
                .summary(log.getSummary())
                .status(log.getStatus())
                .failureReason(log.getFailureReason())
                .providerGroupId(log.getProviderGroupId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
