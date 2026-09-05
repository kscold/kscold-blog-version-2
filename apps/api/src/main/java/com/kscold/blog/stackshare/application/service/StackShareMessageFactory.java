package com.kscold.blog.stackshare.application.service;

import com.kscold.blog.stackshare.domain.model.StackShareMessage;
import com.kscold.blog.stackshare.domain.model.StackShareSettlement;
import java.util.List;
import java.util.Map;

final class StackShareMessageFactory {

    private StackShareMessageFactory() {}

    static List<StackShareMessage> create(StackShareSettlement settlement, String templateId) {
        return settlement.getRecipients().stream()
                .map(recipient -> createMessage(settlement, recipient, templateId))
                .toList();
    }

    private static StackShareMessage createMessage(
            StackShareSettlement settlement,
            StackShareSettlement.Recipient recipient,
            String templateId) {
        Map<String, String> variables =
                Map.of(
                        "#{이름}", recipient.getName(),
                        "#{정산기간}", settlement.getBillingPeriod(),
                        "#{서비스명}", settlement.getToolName(),
                        "#{총금액}", StackShareAmountFormatter.formatWon(settlement.getTotalAmount()),
                        "#{참여인원}", String.valueOf(settlement.getShareCount()),
                        "#{분담금}", StackShareAmountFormatter.formatWon(recipient.getAmount()),
                        "#{입금계좌}", settlement.getAccountText(),
                        "#{입금기한}", settlement.getDueDate(),
                        "#{연락처}", settlement.getContactText());
        return new StackShareMessage(recipient.getPhoneNumber(), templateId, variables);
    }
}
