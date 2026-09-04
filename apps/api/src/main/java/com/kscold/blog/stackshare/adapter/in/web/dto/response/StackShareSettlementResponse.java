package com.kscold.blog.stackshare.adapter.in.web.dto.response;

import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StackShareSettlementResponse {

    private String id;
    private String toolName;
    private String billingPeriod;
    private long totalAmount;
    private String dueDate;

    /** 발송 당시 안내한 입금 계좌. 이후 계좌를 바꿔도 보낸 내용 그대로 남는다. */
    private String accountText;

    /** 발송 당시 안내한 문의 연락처. */
    private String contactText;

    /** 총액을 나눈 인원 수. 본인을 포함했다면 받는 사람 수 + 1. */
    private int shareCount;

    /** 본인도 분담 인원에 넣었는지 여부. */
    private boolean includeOwner;

    /** 본인 몫. 본인을 포함했을 때만 0보다 크다. */
    private long ownerAmount;

    private StackShareSettlement.Status status;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
    private List<RecipientResponse> recipients;

    public static StackShareSettlementResponse from(StackShareSettlement settlement) {
        return StackShareSettlementResponse.builder()
                .id(settlement.getId())
                .toolName(settlement.getToolName())
                .billingPeriod(settlement.getBillingPeriod())
                .totalAmount(settlement.getTotalAmount())
                .dueDate(settlement.getDueDate())
                .accountText(settlement.getAccountText())
                .contactText(settlement.getContactText())
                .shareCount(settlement.getShareCount())
                .includeOwner(settlement.isIncludeOwner())
                .ownerAmount(settlement.getOwnerAmount())
                .status(settlement.getStatus())
                .sentAt(settlement.getSentAt())
                .createdAt(settlement.getCreatedAt())
                .recipients(
                        settlement.getRecipients().stream().map(RecipientResponse::from).toList())
                .build();
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientResponse {
        private String participantId;
        private String name;
        private String phoneNumber;
        private long amount;

        private static RecipientResponse from(StackShareSettlement.Recipient recipient) {
            return RecipientResponse.builder()
                    .participantId(recipient.getParticipantId())
                    .name(recipient.getName())
                    .phoneNumber(recipient.getPhoneNumber())
                    .amount(recipient.getAmount())
                    .build();
        }
    }
}
