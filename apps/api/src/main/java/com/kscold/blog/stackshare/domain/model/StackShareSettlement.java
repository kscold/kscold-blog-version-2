package com.kscold.blog.stackshare.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stack_share_settlements")
public class StackShareSettlement {

    @Id private String id;
    private String toolName;
    private String billingPeriod;
    private long totalAmount;

    /** 입금 기한 표기. 알림톡에 그대로 나가며, 비어 있으면 발송 시 "협의" 로 대체한다. */
    private String dueDate;

    /** 발송 시점의 입금 계좌 표기. 계좌가 바뀌어도 보낸 내용을 그대로 남기기 위해 스냅샷으로 저장한다. */
    private String accountText;

    /** 발송 시점의 문의 연락처 표기. 계좌와 같은 이유로 스냅샷으로 남긴다. */
    private String contactText;

    @Builder.Default private List<Recipient> recipients = new ArrayList<>();

    /** 총액을 나눈 인원 수. 본인을 포함했다면 받는 사람 수 + 1 이다. 알림톡 #{참여인원} 으로 나간다. */
    private int shareCount;

    /** 결제한 본인도 분담 인원에 넣었는지 여부. */
    private boolean includeOwner;

    /** 본인 몫. 본인을 포함했을 때만 0보다 크며, 나누어떨어지지 않은 나머지는 본인이 부담한다. */
    private long ownerAmount;

    private Status status;
    private String messageGroupId;
    private LocalDateTime sentAt;

    @CreatedDate private LocalDateTime createdAt;

    public enum Status {
        DRAFT,
        SENT,
        FAILED
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recipient {
        private String participantId;
        private String name;
        private String phoneNumber;
        private long amount;
    }
}
