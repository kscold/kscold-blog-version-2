package com.kscold.blog.stackshare.application.dto;

/** dueDate: 입금 기한 표기(예 "9월 5일"). 비우면 알림톡에서 기한 문구를 "협의" 로 안내한다. */
public record StackShareSettlementCommand(
        String toolName, String billingPeriod, long totalAmount, String dueDate) {}
