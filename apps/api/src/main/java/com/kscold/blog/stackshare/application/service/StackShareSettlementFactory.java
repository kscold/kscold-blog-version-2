package com.kscold.blog.stackshare.application.service;

import com.kscold.blog.stackshare.application.dto.StackShareSettlementCommand;
import com.kscold.blog.stackshare.domain.model.StackShareAccount;
import com.kscold.blog.stackshare.domain.model.StackShareParticipant;
import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.ArrayList;
import java.util.List;

final class StackShareSettlementFactory {

    private static final String DUE_DATE_FALLBACK = "협의";

    private StackShareSettlementFactory() {}

    static StackShareSettlement create(
            StackShareSettlementCommand source,
            StackShareAccount account,
            List<StackShareParticipant> participants) {
        int receiverCount = participants.size();
        int shareCount = receiverCount + (source.includeOwner() ? 1 : 0);
        long baseAmount = source.totalAmount() / shareCount;
        long remainder = source.totalAmount() % shareCount;
        long receiverRemainder = source.includeOwner() ? 0 : remainder;

        return StackShareSettlement.builder()
                .toolName(source.toolName().trim())
                .billingPeriod(source.billingPeriod().trim())
                .totalAmount(source.totalAmount())
                .dueDate(resolveDueDate(source.dueDate()))
                .accountText(account.toDisplayText())
                .contactText(account.toContactText())
                .recipients(createRecipients(participants, baseAmount, receiverRemainder))
                .shareCount(shareCount)
                .includeOwner(source.includeOwner())
                .ownerAmount(source.includeOwner() ? baseAmount + remainder : 0)
                .status(StackShareSettlement.Status.DRAFT)
                .build();
    }

    private static List<StackShareSettlement.Recipient> createRecipients(
            List<StackShareParticipant> participants, long baseAmount, long receiverRemainder) {
        List<StackShareSettlement.Recipient> recipients = new ArrayList<>();
        for (int index = 0; index < participants.size(); index++) {
            StackShareParticipant participant = participants.get(index);
            recipients.add(
                    StackShareSettlement.Recipient.builder()
                            .participantId(participant.getId())
                            .name(participant.getName())
                            .phoneNumber(participant.getPhoneNumber())
                            .amount(baseAmount + (index < receiverRemainder ? 1 : 0))
                            .build());
        }
        return recipients;
    }

    private static String resolveDueDate(String dueDate) {
        String normalizedDueDate = dueDate == null ? "" : dueDate.trim();
        return normalizedDueDate.isBlank() ? DUE_DATE_FALLBACK : normalizedDueDate;
    }
}
