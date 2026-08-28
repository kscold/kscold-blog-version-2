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
