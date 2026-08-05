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
