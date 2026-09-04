package com.kscold.blog.notification.domain.model;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * 밖으로 나간 알림 한 건의 기록.
 *
 * <p>알림톡은 솔라피에서 도달 여부를 다시 조회할 수 있지만 이메일은 SMTP 라 조회할 곳이 없다. 그래서 보낸 시점의 사실을 여기에 남겨두고, 알림톡은 필요할 때 솔라피
 * 상태를 덧입혀 보여준다.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "message_delivery_logs")
@CompoundIndexes({
    @CompoundIndex(name = "channel_created_idx", def = "{'channel': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "status_created_idx", def = "{'status': 1, 'createdAt': -1}")
})
public class MessageDeliveryLog {

    @Id private String id;

    private Channel channel;

    /** 무엇 때문에 보냈는지. 예) "STACK_SHARE_SETTLEMENT", "ACCESS_REQUEST_APPROVED" */
    @Indexed private String purpose;

    /** 받는 사람. 휴대전화 번호 또는 이메일 주소 */
    @Indexed private String recipient;

    private String recipientName;

    /** 보낸 내용 요약. 알림톡은 변수 값, 이메일은 제목을 남긴다. */
    private String summary;

    private Status status;

    /** 실패했다면 그 이유. 성공이면 비어 있다. */
    private String failureReason;

    /** 솔라피 그룹 아이디. 이 값으로 실제 도달 상태를 다시 조회한다. */
    @Indexed private String providerGroupId;

    private String providerMessageId;

    @CreatedDate private LocalDateTime createdAt;

    public enum Channel {
        ALIMTALK,
        EMAIL
    }

    public enum Status {
        /** 발송 요청까지는 성공. 알림톡은 아직 도달 여부를 모른다 */
        SENT,
        /** 발송 요청 자체가 실패 */
        FAILED
    }

    public static MessageDeliveryLog sent(
            Channel channel,
            String purpose,
            String recipient,
            String recipientName,
            String summary) {
        return MessageDeliveryLog.builder()
                .channel(channel)
                .purpose(purpose)
                .recipient(recipient)
                .recipientName(recipientName)
                .summary(summary)
                .status(Status.SENT)
                .build();
    }

    public static MessageDeliveryLog failed(
            Channel channel,
            String purpose,
            String recipient,
            String recipientName,
            String summary,
            String failureReason) {
        return MessageDeliveryLog.builder()
                .channel(channel)
                .purpose(purpose)
                .recipient(recipient)
                .recipientName(recipientName)
                .summary(summary)
                .status(Status.FAILED)
                .failureReason(failureReason)
                .build();
    }
}
