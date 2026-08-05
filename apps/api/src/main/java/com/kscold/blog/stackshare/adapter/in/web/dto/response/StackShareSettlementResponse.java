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
