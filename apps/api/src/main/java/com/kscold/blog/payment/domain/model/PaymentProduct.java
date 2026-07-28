package com.kscold.blog.payment.domain.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentProduct {
    AI_AGENT_BLOOM(
            "ai-agent-bloom",
            "AI Agent Bloom 참가권",
            "AI Agent, 같이 만들고 피워보는 Bloom 참가권",
            30_000,
            "KRW",
            "결제 완료 직후부터 해당 오프라인 모임 종료 시까지 (결제일로부터 1년 이내 제공)",
            "bloom"),
    KAKAO_PAY_LIVE_TEST(
            "kakaopay-live-test",
            "카카오페이 1,000원 실결제 확인",
            "KSCOLD 카카오페이 1,000원 실결제 확인",
            1_000,
            "KRW",
            "결제 완료 즉시 결제 연동 확인 서비스 제공",
            "kpaytest");

    private final String programKey;
    private final String productName;
    private final String orderName;
    private final int totalAmount;
    private final String currency;
    private final String servicePeriod;
    private final String paymentIdPrefix;
}
