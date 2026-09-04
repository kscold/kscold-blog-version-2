package com.kscold.blog.stackshare.application.dto;

/**
 * dueDate: 입금 기한 표기(예 "9월 5일"). 비우면 알림톡에서 기한 문구를 "협의" 로 안내한다.
 *
 * <p>includeOwner: 결제한 본인도 분담 인원에 포함할지 여부. 포함하면 총액을 (받는 사람 + 1)로 나누고 본인 몫은 알림톡을 보내지 않는다. 제외하면 받는
 * 사람끼리만 나눈다.
 */
public record StackShareSettlementCommand(
        String toolName,
        String billingPeriod,
        long totalAmount,
        String dueDate,
        boolean includeOwner) {}
