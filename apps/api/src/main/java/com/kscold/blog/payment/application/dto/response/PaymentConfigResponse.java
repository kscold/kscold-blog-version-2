package com.kscold.blog.payment.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class PaymentConfigResponse {

    private boolean configured;

    /** 카카오페이 실연동 채널 사용 여부. 고객 화면의 결제 안내 문구를 실제 결제 상태와 맞추는 데 사용함. */
    private boolean livePayment;

    /** KG이니시스 신용카드 결제 사용 가능 여부. false 면 프론트에서 카드 결제 진입 버튼을 숨김. */
    private boolean cardConfigured;

    private String storeId;

    private String channelKey;

    private String productName;

    private String orderName;

    private int totalAmount;

    private String currency;

    private String servicePeriod;
}
